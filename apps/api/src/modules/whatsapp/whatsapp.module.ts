import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappAiListener } from './whatsapp-ai.listener';
import { WhatsappStatusListener } from './whatsapp-status.listener';
import { RedisModule } from '../redis/redis.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [RedisModule, AiModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappAiListener, WhatsappStatusListener],
  exports: [WhatsappService],
})
export class WhatsappModule {}
