import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const isProd = process.env.NODE_ENV === 'production';
    const secret = this.configService.get<string>('ENCRYPTION_SECRET_KEY');

    if (!secret) {
      if (isProd) {
        throw new Error('FATAL: ENCRYPTION_SECRET_KEY environment variable is mandatory in production!');
      }
      this.logger.warn('ENCRYPTION_SECRET_KEY not set. Using dev fallback. DO NOT USE IN PRODUCTION.');
    }

    const effectiveSecret = secret || this.configService.get<string>('CLERK_SECRET_KEY') || 'zerodesk-dev-only-secret-key-32b';

    // Ensure 32-byte key for AES-256
    this.key = crypto.createHash('sha256').update(effectiveSecret).digest();
  }

  /**
   * Encrypts plaintext string using AES-256-GCM with authentication tag and random IV.
   * Output format: iv:authTag:ciphertext (hex encoded)
   */
  encrypt(plaintext: string): string {
    if (!plaintext) return plaintext;
    try {
      const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
      ciphertext += cipher.final('hex');
      
      const authTag = cipher.getAuthTag().toString('hex');
      return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
    } catch (error) {
      this.logger.error(`Encryption failed: ${error}`);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  /**
   * Decrypts an AES-256-GCM ciphertext string with authentication verification.
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        // Not in encrypted format, return as-is
        return encryptedText;
      }

      const [ivHex, authTagHex, ciphertextHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error(`Decryption verification failed (potential tampering): ${error}`);
      throw new Error('Data integrity check failed or corrupted ciphertext');
    }
  }

  /**
   * Generates a cryptographic HMAC-SHA256 signature for webhook verification.
   */
  generateHmac(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Timing-safe verification to prevent side-channel timing attacks.
   */
  verifyTimingSafe(providedSignature: string, computedSignature: string): boolean {
    try {
      const a = Buffer.from(providedSignature);
      const b = Buffer.from(computedSignature);
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
}
