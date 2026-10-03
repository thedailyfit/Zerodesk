import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RagService } from './rag.service';

export interface IndexDocumentJobData {
  tenantId: string;
  documentId: string;
}

@Processor('rag-embedding')
export class EmbeddingProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbeddingProcessor.name);

  constructor(private readonly ragService: RagService) {
    super();
  }

  async process(job: Job<IndexDocumentJobData>): Promise<any> {
    this.logger.log("Processing RAG embedding job [redacted] for document [redacted]");
    const count = await this.ragService.indexDocument(job.data.tenantId, job.data.documentId);
    return { indexedChunks: count };
  }
}
