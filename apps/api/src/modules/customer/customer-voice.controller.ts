import { Controller, Get, Query, Headers, UseGuards, BadRequestException } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { InternalVoiceGuard } from '../../common/guards/internal-voice.guard';

@Controller('customers')
export class CustomerVoiceController {
  constructor(private readonly customerService: CustomerService) {}

  /**
   * Pre-call customer lookup for LiveKit voice agents.
   * Enables personalized greetings with patient name & past visit history.
   */
  @Get('lookup')
  @UseGuards(InternalVoiceGuard)
  async lookupByPhone(
    @Query('phone') phone: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!phone || !tenantId) {
      throw new BadRequestException('Query parameter "phone" and header "x-tenant-id" are required');
    }
    return this.customerService.findByPhone(tenantId, phone);
  }
}
