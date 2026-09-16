import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { PrismaService } from '../../prisma/prisma.service';

export interface SubmitKycDto {
  businessName: string;
  tradeName?: string;
  gstin?: string;
  panNumber?: string;
  addressProofUrl?: string;
  idProofUrl?: string;
}

@Controller('tenants/kyc')
@UseGuards(AuthGuard, TenantGuard)
export class KycController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getKycStatus(@TenantId() tenantId: string) {
    const kyc = await this.prisma.tenantKyc.findUnique({
      where: { tenantId },
    });
    const voiceConfig = await this.prisma.voiceConfig.findUnique({
      where: { tenantId },
      select: {
        plivoPhoneNumber: true,
        isActive: true,
      },
    });

    return {
      status: kyc?.status || 'UNSUBMITTED',
      kyc: kyc || null,
      phoneNumber: voiceConfig?.plivoPhoneNumber || null,
      phoneActive: voiceConfig?.isActive || false,
    };
  }

  @Post()
  async submitKyc(@TenantId() tenantId: string, @Body() dto: SubmitKycDto) {
    if (!dto.businessName || dto.businessName.trim().length === 0) {
      throw new BadRequestException('Business name is required for KYC');
    }

    const kyc = await this.prisma.tenantKyc.upsert({
      where: { tenantId },
      update: {
        businessName: dto.businessName.trim(),
        tradeName: dto.tradeName?.trim() || null,
        gstin: dto.gstin?.trim() || null,
        panNumber: dto.panNumber?.trim() || null,
        addressProofUrl: dto.addressProofUrl || null,
        idProofUrl: dto.idProofUrl || null,
        status: 'PENDING',
        rejectionReason: null,
      },
      create: {
        tenantId,
        businessName: dto.businessName.trim(),
        tradeName: dto.tradeName?.trim() || null,
        gstin: dto.gstin?.trim() || null,
        panNumber: dto.panNumber?.trim() || null,
        addressProofUrl: dto.addressProofUrl || null,
        idProofUrl: dto.idProofUrl || null,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      message: 'Business KYC submitted successfully. Under review by telecommunications compliance.',
      kyc,
    };
  }
}
