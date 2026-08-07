import { Controller, Post, Body, Headers, UnauthorizedException, BadRequestException, RawBodyRequest, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Webhook } from 'svix';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth & Webhooks')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Clerk Auth Webhook events (User/Org Sync)' })
  async handleWebhook(
    @Req() req: any,
    @Body() payload: any,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret || webhookSecret === 'whsec_xxx') {
      throw new UnauthorizedException('Webhook secret is not configured');
    }

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new UnauthorizedException('Missing Svix signature headers');
    }

    try {
      const wh = new Webhook(webhookSecret);
      const bodyStr = req.rawBody?.toString() || JSON.stringify(payload);
      wh.verify(bodyStr, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid Svix signature verification failed');
    }

    return this.authService.processWebhook(payload);
  }
}
