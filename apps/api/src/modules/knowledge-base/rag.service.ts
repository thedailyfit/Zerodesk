import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TypeSafeService } from '../typesafe/typesafe.service';
import { ActiveNiche } from '../typesafe/typesafe.constants';

export interface SearchResult {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  category: string;
  chunkText: string;
  similarity: number;
}

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
    @InjectQueue('rag-embedding') private ragQueue: Queue,
    @Optional() private typeSafeService?: TypeSafeService,
  ) {}

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_hnsw_idx 
        ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
      `);
      this.logger.log('Verified HNSW vector index on knowledge_chunks');
    } catch (e: any) {
      this.logger.warn(`Could not verify HNSW index automatically: ${e.message}`);
    }
  }

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
   * Two-stage hybrid search across a tenant's knowledge base.
   * Stage 1: Broad candidate retrieval (Dense Vector + Full-text keyword search).
   * Stage 2: Reciprocal Rank Fusion (RRF) and Semantic Cross-Reranking.
   * Stage 3: TypeSafe Jev Passage Shield (Anti-Injection & Policy Filter).
   */
  async search(tenantId: string, query: string, topK = 5, niche: ActiveNiche = 'skin'): Promise<SearchResult[]> {
    try {
      let vectorResults: SearchResult[] = [];
      try {
        const embedding = await this.embeddingService.createEmbedding(query);
        const embeddingStr = `[${embedding.join(',')}]`;

        // 1. Stage 1A: Vector cosine similarity search (Top-15 candidates)
        vectorResults = await this.prisma.$queryRaw<SearchResult[]>`
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
            AND kd.status = 'ACTIVE'
            AND kc.version = kd.version
            AND kc.embedding IS NOT NULL
          ORDER BY kc.embedding <=> ${embeddingStr}::vector
          LIMIT 15
        `;
      } catch (embErr: any) {
        this.logger.warn(`Vector search unavailable, falling back to keyword search: ${embErr.message}`);
      }

      // 2. Stage 1B: Multi-token keyword search for exact clinical, service, and pricing terms
      const cleanKeyword = query.replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
      const isIndic = /[\u0900-\u097F\u0C00-\u0C7F]/.test(cleanKeyword);
      const tokens = cleanKeyword
        .split(/\s+/)
        .filter((t) => (isIndic ? t.length >= 2 : t.length > 2) && !['what', 'when', 'where', 'how', 'the', 'and', 'for', 'are', 'can', 'with', 'from', 'your', 'tell', 'about', 'much', 'does', 'please'].includes(t.toLowerCase()));

      let keywordResults: SearchResult[] = [];
      if (tokens.length > 0 || cleanKeyword.length >= 2) {
        try {
          const primary = tokens[0] || cleanKeyword;
          const secondary = tokens[1] || primary;
          const tertiary = tokens[2] || primary;
          keywordResults = await this.prisma.$queryRaw<SearchResult[]>`
            SELECT 
              kc.id as "chunkId",
              kc.document_id as "documentId",
              kd.title as "documentTitle",
              kd.category,
              kc.chunk_text as "chunkText",
              0.80::float as similarity
            FROM knowledge_chunks kc
            JOIN knowledge_documents kd ON kd.id = kc.document_id
            WHERE kc.tenant_id = ${tenantId}::uuid
              AND kd.is_active = true
              AND kd.status = 'ACTIVE'
              AND kc.version = kd.version
              AND (
                kc.chunk_text ILIKE ${'%' + cleanKeyword + '%'}
                OR kc.chunk_text ILIKE ${'%' + primary + '%'}
                OR kc.chunk_text ILIKE ${'%' + secondary + '%'}
                OR kc.chunk_text ILIKE ${'%' + tertiary + '%'}
              )
            LIMIT 10
          `;
        } catch {
          // Fallback gracefully to vector results if ILIKE fails
        }
      }

      // 3. Combine initial candidate pool
      const candidatesMap = new Map<string, SearchResult>();
      for (const r of [...vectorResults, ...keywordResults]) {
        if (!candidatesMap.has(r.chunkId)) {
          candidatesMap.set(r.chunkId, r);
        }
      }

      const candidateList = Array.from(candidatesMap.values());
      const reranked = this.rerank(query, candidateList, 12);

      // Stage 3: TypeSafe Jev Passage Shield (Parallel 70ms screening)
      if (this.typeSafeService) {
        try {
          const screened = await this.typeSafeService.screenRagChunksParallel(
            query,
            reranked.map((c) => ({ chunkId: c.chunkId, chunkText: c.chunkText })),
            niche,
            150, // 150ms timeout
          );

          const safeChunkIds = new Set(screened.filter((s) => s.passed).map((s) => s.chunkId));
          const filtered = reranked.filter((c) => safeChunkIds.has(c.chunkId));

          return (filtered.length > 0 ? filtered : reranked).slice(0, topK);
        } catch (shieldErr: any) {
          this.logger.warn(`TypeSafe Jev passage shield bypassed: ${shieldErr?.message}`);
          return reranked.slice(0, topK);
        }
      }

      return reranked.slice(0, topK);
    } catch (error) {
      this.logger.error(`RAG search failed: ${error}`, (error as Error).stack);
      return [];
    }
  }

  /**
   * Stage 2: Reciprocal Rank Fusion (RRF) & Semantic Relevance Cross-Reranker.
   * Rescores candidates based on vector similarity, exact entity density, and reciprocal ranking.
   */
  rerank(query: string, candidates: SearchResult[], topK = 5): SearchResult[] {
    if (candidates.length === 0) return [];

    const isIndic = /[\u0900-\u097F\u0C00-\u0C7F]/.test(query);
    const queryTokens = query
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((t) => (isIndic ? t.length >= 2 : t.length > 2) && !['what', 'when', 'where', 'how', 'the', 'and', 'for', 'are', 'can'].includes(t));

    const scored = candidates.map((candidate, rank) => {
      const text = candidate.chunkText.toLowerCase();
      const title = candidate.documentTitle.toLowerCase();

      // Entity / Keyword match bonus
      let matchCount = 0;
      for (const token of queryTokens) {
        if (text.includes(token) || title.includes(token)) {
          matchCount++;
        }
      }

      const tokenCoverage = queryTokens.length > 0 ? matchCount / queryTokens.length : 0;
      // Reciprocal Rank Fusion score (k=60)
      const rrfScore = 1 / (60 + (rank + 1));
      // Cross-rerank calibrated similarity: blend vector cosine similarity with lexical entity coverage
      const rerankedSimilarity = (candidate.similarity * 0.65) + (tokenCoverage * 0.30) + (rrfScore * 5);
      const boundedScore = Math.min(1.0, Math.max(0.0, Number(rerankedSimilarity.toFixed(4))));

      return {
        ...candidate,
        similarity: boundedScore,
      };
    });

    const cutoff = isIndic ? 0.32 : 0.38;
    return scored
      .filter((c) => c.similarity >= cutoff)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
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

    const currentVersion = doc.version || 1;
    const targetVersion = currentVersion + 1;

    // 1. Mark document as INDEXING while keeping currentVersion chunks active
    await this.prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { status: 'INDEXING' },
    });

    // 2. Split content into table-aware semantic chunks (~500 chars with overlap)
    const chunks = this.splitIntoChunks(doc.content, 500, 50);

    // 3. Generate embeddings and insert new chunks with targetVersion
    let indexed = 0;
    const batchSize = 5;

    try {
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (chunkText, batchIdx) => {
            const chunkIdx = i + batchIdx;
            try {
              const embedding = await this.embeddingService.createEmbedding(chunkText);
              const embeddingStr = `[${embedding.join(',')}]`;

              await this.prisma.$executeRaw`
                INSERT INTO knowledge_chunks (id, tenant_id, document_id, version, chunk_text, chunk_index, embedding, created_at)
                VALUES (gen_random_uuid(), ${tenantId}::uuid, ${documentId}::uuid, ${targetVersion}, ${chunkText}, ${chunkIdx}, ${embeddingStr}::vector, NOW())
              `;
              indexed++;
            } catch (error: any) {
              this.logger.warn(`Failed to index chunk ${chunkIdx} of document ${documentId}: ${error?.message || error}`);
            }
          }),
        );
      }

      // 4. Atomic pointer switch: Activate targetVersion and purge stale chunks
      await this.prisma.$transaction([
        this.prisma.knowledgeDocument.update({
          where: { id: documentId },
          data: {
            version: targetVersion,
            status: 'ACTIVE',
            errorMessage: null,
          },
        }),
        this.prisma.knowledgeChunk.deleteMany({
          where: {
            documentId,
            version: { lt: targetVersion },
          },
        }),
      ]);

      this.logger.log(`Atomically activated version ${targetVersion} (${indexed}/${chunks.length} chunks) for document ${documentId}`);
      return indexed;
    } catch (err: any) {
      this.logger.error(`Indexing failed for document ${documentId}: ${err.message}`, err.stack);
      await this.prisma.knowledgeDocument.update({
        where: { id: documentId },
        data: {
          status: 'FAILED',
          errorMessage: err.message,
        },
      });
      // Purge incomplete targetVersion chunks so no partial state remains
      await this.prisma.knowledgeChunk.deleteMany({
        where: { documentId, version: targetVersion },
      });
      throw err;
    }
  }

  /**
   * Split text into table-aware, semantic chunks for embedding.
   * Markdown and HTML tables are preserved without mid-cell splits,
   * and column headers are re-prepended to every split chunk of a table.
   */
  private splitIntoChunks(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
    const chunks: string[] = [];
    const lines = text.split('\n');
    let currentBlock: string[] = [];
    let inMarkdownTable = false;
    let tableHeaderRows: string[] = [];

    const flushBlock = () => {
      if (currentBlock.length === 0) return;
      const blockText = currentBlock.join('\n').trim();
      if (blockText) {
        if (inMarkdownTable && tableHeaderRows.length > 0) {
          this.chunkMarkdownTable(currentBlock, tableHeaderRows, chunkSize, chunks);
        } else {
          this.chunkProseText(blockText, chunkSize, overlap, chunks);
        }
      }
      currentBlock = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isTableLine = /^\s*\|.*\|\s*$/.test(line);

      if (isTableLine) {
        if (!inMarkdownTable) {
          flushBlock();
          inMarkdownTable = true;
          tableHeaderRows = [];
          if (i + 1 < lines.length && /^\s*\|[-:\s|]+\|\s*$/.test(lines[i + 1])) {
            tableHeaderRows.push(line);
            tableHeaderRows.push(lines[i + 1]);
          }
        }
        currentBlock.push(line);
      } else {
        if (inMarkdownTable) {
          flushBlock();
          inMarkdownTable = false;
          tableHeaderRows = [];
        }
        currentBlock.push(line);
      }
    }

    flushBlock();
    return chunks.length > 0 ? chunks : [text.trim()];
  }

  private chunkMarkdownTable(
    tableLines: string[],
    headers: string[],
    chunkSize: number,
    outputChunks: string[],
  ) {
    const headerText = headers.join('\n');
    const dataRows = tableLines.slice(headers.length);
    let currentRows: string[] = [];

    for (const row of dataRows) {
      const candidateChunk = [headerText, ...currentRows, row].join('\n');
      if (candidateChunk.length > chunkSize && currentRows.length > 0) {
        outputChunks.push([headerText, ...currentRows].join('\n').trim());
        currentRows = [row];
      } else {
        currentRows.push(row);
      }
    }

    if (currentRows.length > 0) {
      outputChunks.push([headerText, ...currentRows].join('\n').trim());
    }
  }

  private chunkProseText(
    text: string,
    chunkSize: number,
    overlap: number,
    outputChunks: string[],
  ) {
    const sentences = text.split(/(?<=[.!?\n])\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length > chunkSize && currentChunk.length > 0) {
        outputChunks.push(currentChunk.trim());
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 5));
        currentChunk = overlapWords.join(' ') + ' ' + sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk.trim()) {
      outputChunks.push(currentChunk.trim());
    }
  }
}
