import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('webhook')
  async handleWebhook(@Body() payload: any, @Headers('svix-signature') signature: string) {
    if (!signature) {
      throw new UnauthorizedException('Missing signature');
    }
    // Verify svix signature here (omitted for brevity)
    return this.authService.processWebhook(payload);
  }
}
