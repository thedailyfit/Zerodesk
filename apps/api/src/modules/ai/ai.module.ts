import { forwardRef, Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ContextService } from './context.service';
import { PromptService } from './prompt.service';
import { LlmService } from './llm.service';
import { KnowledgeModule } from '../knowledge-base/knowledge.module';

@Module({
  imports: [forwardRef(() => KnowledgeModule)],
  providers: [AiService, ContextService, PromptService, LlmService],
  exports: [AiService, LlmService],
})
export class AiModule {}
