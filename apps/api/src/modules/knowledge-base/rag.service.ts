import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface SearchResult {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  category: string;
  chunkText: string;
  similarity: number;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
    @InjectQueue('rag-embedding') private ragQueue: Queue,
  ) {}

  /**
   * Enqueue document indexing into background queue (non-blocking).
   */
  async enqueueIndexDocument(tenantId: string, documentId: string) {
    const job = await this.ragQueue.add('index-doc', { tenantId, documentId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
    this.logger.log(`Enqueued document ${documentId} for indexing (Job ID: ${job.id})`);
    return { jobId: job.id, status: 'enqueued' };
  }

  /**
   * Semantic search across a tenant's knowledge base using pgvector.
   * Generates an embedding for the query, then finds the most similar chunks.
   */
  async search(tenantId: string, query: string, topK = 5): Promise<SearchResult[]> {
    try {
      const embedding = await this.embeddingService.createEmbedding(query);
      const embeddingStr = `[${embedding.join(',')}]`;

      // Use pgvector's cosine distance operator (<=>)
      const results = await this.prisma.$queryRaw<SearchResult[]>`
        SELECT 
          kc.id as "chunkId",
          kc.document_id as "documentId",
          kd.title as "documentTitle",
          kd.category,
          kc.chunk_text as "chunkText",
          1 - (kc.embedding <=> ${embeddingStr}::vector) as similarity
        FROM knowledge_chunks kc
        JOIN knowledge_documents kd ON kd.id = kc.document_id
        WHERE kc.tenant_id = ${tenantId}::uuid
          AND kd.is_active = true
          AND kc.embedding IS NOT NULL
        ORDER BY kc.embedding <=> ${embeddingStr}::vector
        LIMIT ${topK}
      `;

      return results.filter((r: any) => r.similarity > 0.3); // Minimum relevance threshold
    } catch (error) {
      this.logger.error(`RAG search failed: ${error}`, (error as Error).stack);
      return [];
    }
  }

  /**
   * Build a context string from search results for AI prompt injection.
   */
  buildKnowledgeContext(results: SearchResult[]): string {
    if (results.length === 0) return '';

    const sections = results.map(
      (r) =>
        `[${r.category} — ${r.documentTitle}]\n${r.chunkText}`,
    );

    return `## Relevant Knowledge Base Information\n\n${sections.join('\n\n---\n\n')}`;
  }

  /**
   * Process a document: split into chunks, generate embeddings, and store.
   */
  async indexDocument(tenantId: string, documentId: string): Promise<number> {
    const doc = await this.prisma.knowledgeDocument.findFirst({
      where: { id: documentId, tenantId },
    });

    if (!doc) throw new Error('Document not found');

    // Split content into chunks (~500 chars each with overlap)
    const chunks = this.splitIntoChunks(doc.content, 500, 50);

    // Delete existing chunks for re-indexing
    await this.prisma.knowledgeChunk.deleteMany({
      where: { documentId, tenantId },
    });

    // Generate embeddings and store chunks in parallel batches of 5
    let indexed = 0;
    const batchSize = 5;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (chunkText, batchIdx) => {
          const chunkIdx = i + batchIdx;
          try {
            const embedding = await this.embeddingService.createEmbedding(chunkText);
            const embeddingStr = `[${embedding.join(',')}]`;

            await this.prisma.$executeRaw`
              INSERT INTO knowledge_chunks (id, tenant_id, document_id, chunk_text, chunk_index, embedding, created_at)
              VALUES (gen_random_uuid(), ${tenantId}::uuid, ${documentId}::uuid, ${chunkText}, ${chunkIdx}, ${embeddingStr}::vector, NOW())
            `;
            indexed++;
          } catch (error) {
            this.logger.warn(`Failed to index chunk ${chunkIdx} of document ${documentId}: ${error}`);
          }
        }),
      );
    }

    this.logger.log(`Indexed ${indexed}/${chunks.length} chunks for document ${documentId}`);
    return indexed;
  }

  /**
   * Split text into overlapping chunks for embedding.
   */
  private splitIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        // Keep the last few words as overlap
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 5));
        currentChunk = overlapWords.join(' ') + ' ' + sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}
