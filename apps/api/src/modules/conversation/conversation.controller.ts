import { Controller, Get, Post, Patch, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('conversations')
@UseGuards(AuthGuard, TenantGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async findAll(@TenantId() tenantId: string, @Query('status') status?: string) {
    return this.conversationService.findAll(tenantId, status);
  }

  @Get(':id')
  async findById(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.conversationService.findById(tenantId, id);
  }

  @Get(':id/messages')
  async getMessages(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.conversationService.getMessages(tenantId, id);
  }

  @Patch(':id')
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status?: string; aiSummary?: string; sentiment?: string; resolution?: string; metadata?: any },
  ) {
    return this.conversationService.update(tenantId, id, body);
  }

  @Put(':id/status')
  async updateStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.conversationService.update(tenantId, id, { status: body.status });
  }

  @Post(':id/transfer')
  async transfer(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.conversationService.transfer(tenantId, id, data.agentId);
  }
}
