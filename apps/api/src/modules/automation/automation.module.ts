import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { N8nService } from './n8n.service';

@Module({
  controllers: [AutomationController],
  providers: [N8nService],
  exports: [N8nService],
})
export class AutomationModule {}
