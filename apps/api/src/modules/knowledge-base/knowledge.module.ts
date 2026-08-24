import { forwardRef, Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { EmbeddingService } from './embedding.service';
import { RagService } from './rag.service';
import { AiModule } from '../ai/ai.module';

import { BullModule } from '@nestjs/bullmq';
import { EmbeddingProcessor } from './embedding.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'rag-embedding',
    }),
    forwardRef(() => AiModule),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, EmbeddingService, RagService, EmbeddingProcessor],
  exports: [KnowledgeService, RagService, BullModule],
})
export class KnowledgeModule {}
