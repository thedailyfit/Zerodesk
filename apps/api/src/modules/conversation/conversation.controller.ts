import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('conversations')
@UseGuards(AuthGuard, TenantGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async findAll(@TenantId() tenantId: string) {
    return this.conversationService.findAll(tenantId);
  }

  @Get(':id')
  async findById(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.conversationService.findById(tenantId, id);
  }

  @Get(':id/messages')
  async getMessages(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.conversationService.getMessages(tenantId, id);
  }

  @Post(':id/transfer')
  async transfer(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.conversationService.transfer(tenantId, id, data.agentId);
  }
}
