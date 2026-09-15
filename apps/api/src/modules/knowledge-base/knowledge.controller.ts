import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { RagService } from './rag.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { AuthOrInternalVoiceGuard } from '../../common/guards/auth-or-internal-voice.guard';

@Controller('knowledge')
export class KnowledgeController {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly ragService: RagService
  ) {}

  @Get()
  @UseGuards(AuthGuard, TenantGuard)
  async findAll(@TenantId() tenantId: string) {
    return this.knowledgeService.findAll(tenantId);
  }

  @Post()
  @UseGuards(AuthGuard, TenantGuard)
  async create(@TenantId() tenantId: string, @Body() data: any) {
    return this.knowledgeService.create(tenantId, data);
  }

  @Post('upload')
  @UseGuards(AuthGuard, TenantGuard)
  async upload(@TenantId() tenantId: string, @Body() data: any) {
    return this.knowledgeService.uploadDocument(tenantId, data);
  }

  @Post('search')
  @UseGuards(AuthOrInternalVoiceGuard)
  async search(@TenantId() tenantId: string, @Body() data: { query: string }) {
    return this.ragService.search(tenantId, data.query);
  }
}
