import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { ServiceService } from './service.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @UseGuards(AuthGuard, TenantGuard)
  async findAll(@TenantId() tenantId: string) {
    return this.serviceService.findAll(tenantId);
  }

  @Get('search')
  @UseGuards(AuthGuard, TenantGuard)
  async search(
    @TenantId() tenantId: string,
    @Query('query') query: string,
  ) {
    return this.serviceService.search(tenantId, query || '');
  }

  @Get('public/:slug')
  async getPublicServices(@Param('slug') slug: string) {
    return this.serviceService.findPublicBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard, TenantGuard)
  async create(@TenantId() tenantId: string, @Body() data: any) {
    return this.serviceService.create(tenantId, data);
  }
}

