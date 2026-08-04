import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { RagService } from './rag.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('knowledge')
@UseGuards(AuthGuard, TenantGuard)
export class KnowledgeController {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly ragService: RagService
  ) {}

  @Get()
  async findAll(@TenantId() tenantId: string) {
    return this.knowledgeService.findAll(tenantId);
  }

  @Post()
  async create(@TenantId() tenantId: string, @Body() data: any) {
    return this.knowledgeService.create(tenantId, data);
  }

  @Post('upload')
  async upload(@TenantId() tenantId: string, @Body() data: any) {
    return this.knowledgeService.uploadDocument(tenantId, data);
  }

  @Post('search')
  async search(@TenantId() tenantId: string, @Body() data: { query: string }) {
    return this.ragService.search(tenantId, data.query);
  }
}
