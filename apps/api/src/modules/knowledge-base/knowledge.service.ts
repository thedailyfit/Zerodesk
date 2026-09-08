import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { RagService } from './rag.service';

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

  async create(tenantId: string, data: any) {
    return this.prisma.knowledgeDocument.create({
      data: {
        category: 'GENERAL',
        ...data,
        tenantId,
      },
    });
  }

  async uploadDocument(tenantId: string, data: any) {
    return this.processAndEmbedDocument(tenantId, data.title || 'Untitled Document', data.content || '');
  }

  /**
   * High-performance document processing with table-aware RAG chunk embedding.
   */
  async processAndEmbedDocument(tenantId: string, title: string, content: string, category = 'GENERAL') {
    this.logger.log(`Starting knowledge document processing for tenant ${tenantId}: "${title}"`);

    const doc = await this.prisma.knowledgeDocument.create({
      data: {
        tenantId,
        title,
        category,
        content,
        sourceType: 'MANUAL',
      },
    });

    // Delegate indexing to table-aware RagService
    this.ragService.indexDocument(tenantId, doc.id).catch((err) => {
      this.logger.error(`Failed to process document ${doc.id}: ${err.message}`, err.stack);
    });

    return {
      id: doc.id,
      message: 'Document uploaded. Table-aware chunking and pgvector embedding started.',
    };
  }
}
