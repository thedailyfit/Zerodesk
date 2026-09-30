import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { N8nService } from './n8n.service';
import { AutomationSequenceService } from './automation-sequence.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { AutomationRunService } from './automation-run.service';

@Module({
  imports: [WhatsappModule],
  controllers: [AutomationController],
  providers: [N8nService, AutomationSequenceService, AutomationRunService],
  exports: [N8nService, AutomationSequenceService],
})
export class AutomationModule {}
