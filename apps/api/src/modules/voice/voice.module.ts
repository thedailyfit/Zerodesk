import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { KnowledgeModule } from '../knowledge-base/knowledge.module';
import { OutboundCallProcessor } from './outbound-call.processor';

@Module({
  imports: [
    KnowledgeModule,
    BullModule.registerQueue({
      name: 'outbound-calls',
    }),
  ],
  controllers: [VoiceController],
  providers: [VoiceService, OutboundCallProcessor],
  exports: [VoiceService, BullModule],
})
export class VoiceModule {}

