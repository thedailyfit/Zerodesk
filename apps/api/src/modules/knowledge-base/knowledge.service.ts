import { Injectable, Logger, Inject, forwardRef, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { RagService, INDEX_PENDING } from './rag.service';

const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AiService))
    private aiService: AiService,
    private ragService: RagService,
  ) {}

  async findAll(tenantId: string) {
    return this.prisma.knowledgeDocument.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const doc = await this.prisma.knowledgeDocument.findFirst({
      where: { id, tenantId },
    });
    if (!doc) throw new NotFoundException(`Knowledge document ${id} not found`);
    return doc;
  }

  async create(tenantId: string, data: any) {
    return this.processAndEmbedDocument(tenantId, data.title || 'Untitled Document', data.content || '', data.category || 'GENERAL');
  }

  async uploadDocument(tenantId: string, data: any) {
    return this.processAndEmbedDocument(tenantId, data.title || 'Untitled Document', data.content || '', data.category || 'GENERAL');
  }

  async updateDocument(tenantId: string, id: string, data: { title?: string; content?: string; category?: string }) {
    if (data.content !== undefined && (typeof data.content !== 'string' || !data.content.trim() || Buffer.byteLength(data.content, 'utf8') > 2 * 1024 * 1024)) throw new BadRequestException('Document content must contain 1 byte to 2 MB of text');
    const doc = await this.prisma.knowledgeDocument.findFirst({
      where: { id, tenantId },
    });
    if (!doc) throw new NotFoundException(`Knowledge document ${id} not found`);

    const updated = await this.prisma.knowledgeDocument.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : doc.title,
        content: data.content !== undefined ? data.content : doc.content,
        category: data.category !== undefined ? data.category : doc.category,
        ...(data.content !== undefined && data.content !== doc.content ? { errorMessage: INDEX_PENDING } : {}),
      },
    });

    if (data.content && data.content !== doc.content) {
      this.logger.log(`Document ${id} content updated. Triggering versioned atomic re-indexing...`);
      await this.ragService.enqueueIndexDocument(tenantId, id).catch((err) => {
        this.logger.error(`Failed to re-index document ${id}: ${err.message}`);
      });
    }

    return updated;
  }

  async deleteDocument(tenantId: string, id: string) {
    const doc = await this.prisma.knowledgeDocument.findFirst({
      where: { id, tenantId },
    });
    if (!doc) throw new NotFoundException(`Knowledge document ${id} not found`);

    // Atomically purge all associated vector chunks and the document record in one transaction
    const [deletedChunks] = await this.prisma.$transaction([
      this.prisma.knowledgeChunk.deleteMany({
        where: { documentId: id, tenantId },
      }),
      this.prisma.knowledgeDocument.delete({
        where: { id },
      }),
    ]);

    this.logger.log(`Atomically deleted knowledge document ${id} and ${deletedChunks.count} vector chunks for tenant ${tenantId}`);
    return { success: true, message: `Document and ${deletedChunks.count} vector chunks permanently deleted` };
  }

  /**
   * Real binary file parsing for PDF, DOCX, and text formats.
   */
  async parseAndUploadFile(tenantId: string, file: any, category = 'GENERAL') {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded or file buffer is empty');
    }

    const filename = file.originalname || 'document.txt';
      if (file.buffer.length > 10 * 1024 * 1024) throw new BadRequestException('Document exceeds 10 MB');
      if (!/\.(pdf|docx|txt|md|csv)$/i.test(filename)) throw new BadRequestException('Supported documents: PDF, DOCX, TXT, Markdown and CSV');
      if (/\.pdf$/i.test(filename) && file.buffer.subarray(0, 5).toString() !== '%PDF-') throw new BadRequestException('Invalid PDF header');
      if (/\.docx$/i.test(filename) && file.buffer.subarray(0, 2).toString() !== 'PK') throw new BadRequestException('Invalid DOCX archive');
    const cleanTitle = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const title = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    let extractedText = '';

    try {
      if (filename.toLowerCase().endsWith('.pdf') || file.mimetype === 'application/pdf') {
        const parser = new PDFParse({ data: file.buffer });
        try {
          const parsed = await parser.getText();
          extractedText = parsed.text || '';
        } finally {
          if (typeof parser.destroy === 'function') {
            await parser.destroy();
          }
        }
      } else if (
        filename.toLowerCase().endsWith('.docx') ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const parsed = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = parsed.value || '';
      } else {
        extractedText = file.buffer.toString('utf-8');
      }
    } catch (err: any) {
      this.logger.error(`Error parsing uploaded file ${filename}: ${err.message}`, err.stack);
      throw new BadRequestException(`Could not extract text from ${filename}: ${err.message}`);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new BadRequestException(`Uploaded file ${filename} contained no readable text`);
    }

    return this.processAndEmbedDocument(tenantId, title, extractedText.trim(), category);
  }

  /**
   * High-performance document processing with table-aware RAG chunk embedding.
   */
  async processAndEmbedDocument(tenantId: string, title: string, content: string, category = 'GENERAL') {
      if (typeof content !== 'string' || !content.trim()) throw new BadRequestException('Document content cannot be empty');
      if (Buffer.byteLength(content, 'utf8') > 2 * 1024 * 1024) throw new BadRequestException('Extracted document exceeds 2 MB of text');
    this.logger.log(`Starting knowledge document processing for tenant ${tenantId}: "${title}"`);

    const doc = await this.prisma.knowledgeDocument.create({
      data: {
        tenantId,
        title,
        category,
        content,
        sourceType: 'MANUAL',
        status: 'PENDING',
        errorMessage: INDEX_PENDING,
      },
    });

    // Delegate indexing to table-aware RagService
    await this.ragService.enqueueIndexDocument(tenantId, doc.id).catch((err) => {
      this.logger.error(`Failed to process document ${doc.id}: ${err.message}`, err.stack);
    });

    return {
      id: doc.id,
      title: doc.title,
      category: doc.category,
      message: 'Document saved. Indexing is pending background processing.',
    };
  }
}
