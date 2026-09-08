import { Controller, Get, Post, Body, Headers, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CreateCheckoutSessionDto } from './dto/checkout.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  @UseGuards(AuthGuard, TenantGuard)
  async getSubscription(@TenantId() tenantId: string) {
    return this.billingService.getSubscription(tenantId);
  }

  @Post('create-checkout-session')
  @UseGuards(AuthGuard, TenantGuard)
  async createCheckoutSession(
    @TenantId() tenantId: string,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.billingService.createCheckoutSession(tenantId, dto.plan, dto.successUrl, dto.cancelUrl);
  }

  @Post('stripe-webhook')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    const rawBody = req.rawBody || req.body;
    return this.billingService.handleWebhook(rawBody, signature);
  }
}
