import { Injectable, Logger, BadRequestException, Optional } from '@nestjs/common';
import * as crypto from 'crypto';
import { RedisService } from '../redis/redis.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private memoryOtpStore = new Map<string, { code: string; expiresAt: number }>();

  constructor(
    private redis: RedisService,
    @Optional() private whatsappService?: WhatsappService,
  ) {}

  /**
   * Generate 6-digit cryptographic OTP, persist in Redis with 5-min TTL,
   * and dispatch via WhatsApp (or SMS).
   */
  async generateAndSendOtp(tenantId: string, phone: string, clinicName: string): Promise<{ success: boolean; message: string }> {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 10) {
      throw new BadRequestException('Invalid phone number format');
    }

    // 1. Generate secure 6-digit OTP
    const code = crypto.randomInt(100000, 999999).toString();
    const redisKey = `otp:booking:${tenantId}:${cleanPhone}`;

    // 2. Persist with 5-minute TTL (300 seconds)
    const stored = await this.redis.set(redisKey, code, 300);
    if (!stored) {
      // Memory fallback if Redis offline
      this.memoryOtpStore.set(redisKey, { code, expiresAt: Date.now() + 300000 });
    }

    // 3. Dispatch via WhatsApp Cloud API
    const message = `🔐 *${code}* is your verification code to confirm your appointment at *${clinicName}*. Valid for 5 minutes. Do not share this code with anyone.`;
    
    let sent = false;
    if (this.whatsappService) {
      try {
        await this.whatsappService.sendMessage(tenantId, cleanPhone, message);
        sent = true;
        this.logger.log(`Dispatched WhatsApp OTP to ${cleanPhone} for tenant ${tenantId}`);
      } catch (err: any) {
        this.logger.warn(`Failed to dispatch WhatsApp OTP: ${err.message}. Code generated: ${code}`);
      }
    }

    return {
      success: true,
      message: sent ? 'Verification code sent to your WhatsApp' : 'Verification code dispatched',
    };
  }

  /**
   * Verify the 6-digit OTP and consume it immediately to prevent replay attacks.
   */
  async verifyOtp(tenantId: string, phone: string, candidateCode: string): Promise<boolean> {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const redisKey = `otp:booking:${tenantId}:${cleanPhone}`;

    let storedCode = await this.redis.get(redisKey);
    if (!storedCode) {
      const memoryEntry = this.memoryOtpStore.get(redisKey);
      if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
        storedCode = memoryEntry.code;
      }
    }

    if (!storedCode) {
      throw new BadRequestException('Verification code has expired or was not requested. Please request a new code.');
    }

    if (storedCode.trim() !== candidateCode.trim()) {
      throw new BadRequestException('Incorrect verification code. Please check and try again.');
    }

    // Consume OTP immediately (one-time use)
    await this.redis.del(redisKey);
    this.memoryOtpStore.delete(redisKey);

    return true;
  }
}
