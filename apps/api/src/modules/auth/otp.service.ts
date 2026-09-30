import { Injectable, BadRequestException, ServiceUnavailableException, Optional } from '@nestjs/common';
import * as crypto from 'crypto';
import { RedisService } from '../redis/redis.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class OtpService {
  constructor(private redis: RedisService, @Optional() private whatsappService?: WhatsappService) {}
  private phone(value: string) {
    const phone = String(value || '').replace(/[^0-9+]/g, '');
    if (!/^\+?[1-9]\d{9,14}$/.test(phone)) throw new BadRequestException('Invalid phone number');
    return phone.replace(/^\+/, '');
  }
  private hash(value: string) { return crypto.createHash('sha256').update(value).digest('hex'); }
  private key(tenantId: string, phone: string) { return `otp:booking:${tenantId}:${this.hash(phone)}`; }

  async generateAndSendOtp(tenantId: string, phone: string, businessName: string) {
    const recipient = this.phone(phone);
    const key = this.key(tenantId, recipient);
    if (!this.whatsappService || !await this.redis.setNx(key + ':cooldown', '1', 60)) throw new ServiceUnavailableException('Code delivery unavailable or recently requested. Retry later.');
    const code = crypto.randomInt(100000, 1000000).toString();
    if (!await this.redis.set(key, this.hash(code), 300)) throw new ServiceUnavailableException('Verification storage unavailable');
    await this.redis.del(key + ':attempts');
    try {
      const result = await this.whatsappService.sendMessage(tenantId, recipient, `${code} is your verification code for ${businessName}. Valid for 5 minutes. Do not share it.`);
      if (!result?.messages?.[0]?.id) throw new Error('Provider did not accept delivery');
    } catch {
      await this.redis.del(key);
      throw new ServiceUnavailableException('Verification code could not be sent. Please try again later.');
    }
    return { success: true, message: 'Verification code accepted by WhatsApp for delivery' };
  }
  async verifyOtp(tenantId: string, phone: string, code: string): Promise<boolean> {
    if (typeof code !== 'string' || !/^\d{6}$/.test(code) || !await this.redis.consumeOtp(this.key(tenantId, this.phone(phone)), this.hash(code))) throw new BadRequestException('Invalid or expired verification code');
    return true;
  }
}
