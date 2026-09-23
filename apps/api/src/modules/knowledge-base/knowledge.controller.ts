import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
    private readonly ragService: RagService,
  ) {}

  @Get()
  @UseGuards(AuthGuard, TenantGuard)
  async findAll(@TenantId() tenantId: string) {
    return this.knowledgeService.findAll(tenantId);
  }

  @Get(':id')
  @UseGuards(AuthGuard, TenantGuard)
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.knowledgeService.findOne(tenantId, id);
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

  @Post('upload-file')
  @UseGuards(AuthGuard, TenantGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @TenantId() tenantId: string,
    @UploadedFile() file: any,
    @Body('category') category?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required for upload-file endpoint');
    }
    return this.knowledgeService.parseAndUploadFile(tenantId, file, category);
  }

  @Put(':id')
  @UseGuards(AuthGuard, TenantGuard)
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() data: { title?: string; content?: string; category?: string },
  ) {
    return this.knowledgeService.updateDocument(tenantId, id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, TenantGuard)
  async delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.knowledgeService.deleteDocument(tenantId, id);
  }

  @Post('search')
  @UseGuards(AuthOrInternalVoiceGuard)
  async search(
    @TenantId() tenantId: string,
    @Body() data: { query: string; topK?: number; niche?: any; bypassShield?: boolean },
  ) {
    return this.ragService.search(
      tenantId,
      data.query,
      data.topK || 5,
      data.niche || 'skin',
      { bypassShield: Boolean(data.bypassShield) },
    );
  }
}
