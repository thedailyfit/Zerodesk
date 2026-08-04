import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('crm/pipeline')
@UseGuards(AuthGuard, TenantGuard)
export class PipelineController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getPipeline(@TenantId() tenantId: string) {
    return this.prisma.pipelineStage.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
    });
  }
}
