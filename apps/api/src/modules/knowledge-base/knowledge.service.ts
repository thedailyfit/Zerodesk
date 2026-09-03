import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AiService))
    private aiService: AiService,
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
   * High-performance document processing with parallelized chunk embedding.
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

    this.processInBatches(doc.id, tenantId, content).catch((err) => {
      this.logger.error(`Failed to process document ${doc.id}: ${err.message}`, err.stack);
    });

    return {
      id: doc.id,
      message: 'Document uploaded. Background chunking and vector embedding started.',
    };
  }

  private async processInBatches(documentId: string, tenantId: string, text: string) {
    const rawChunks = text.split(/\n\n+/).filter(c => c.trim().length > 0);
    const chunks: string[] = [];

    for (const raw of rawChunks) {
      if (raw.length <= 1000) {
        chunks.push(raw);
      } else {
        for (let i = 0; i < raw.length; i += 500) {
          chunks.push(raw.substring(i, i + 500));
        }
      }
    }

    this.logger.log(`Document ${documentId} split into ${chunks.length} chunks. Generating embeddings in parallel batches...`);

    const BATCH_SIZE = 10;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (chunkText, batchIndex) => {
          const chunkOrder = i + batchIndex;
          try {
            const embedding = await this.aiService.generateEmbedding(chunkText);
            const embeddingStr = `[${embedding.join(',')}]`;

            await this.prisma.$executeRaw`
              INSERT INTO knowledge_chunks (id, tenant_id, document_id, chunk_text, chunk_index, embedding, created_at)
              VALUES (gen_random_uuid(), ${tenantId}::uuid, ${documentId}::uuid, ${chunkText}, ${chunkOrder}, ${embeddingStr}::vector, NOW())
            `;
          } catch (err) {
            this.logger.error(`Error processing chunk ${chunkOrder} of doc ${documentId}:`, err);
          }
        })
      );
    }

    this.logger.log(`Successfully completed RAG embedding for document ${documentId}`);
  }
}
