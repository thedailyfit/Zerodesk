import { Controller, Get, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InternalVoiceGuard } from '../../common/guards/internal-voice.guard';

@Controller('ai')
export class AiController {
  constructor(
    private promptService: PromptService,
    private prisma: PrismaService,
  ) {}

  /**
   * Dynamic prompt synchronization endpoint for LiveKit voice agent workers.
   * Prevents drift between Python voice agent and NestJS WhatsApp/chat prompts.
   */
  @Get('voice-prompt')
  @UseGuards(InternalVoiceGuard)
  async getVoicePrompt(@Query('tenantId') tenantId: string) {
    if (!tenantId || tenantId === 'default_business' || tenantId === 'default') {
      tenantId = '08f1fadd-59eb-4d07-9ee3-65a2d9a321e3';
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant not found: ${tenantId}`);
    }

    const voiceConfig = await this.prisma.voiceConfig.findUnique({ where: { tenantId } });
    const prompt = this.promptService.getSystemPrompt(tenantId, { customer: null, recentInteractions: [], appointments: [], knowledgeContext: '' } as any, tenant.industry);

    return {
      tenantId,
      clinicName: tenant.name,
      greeting: voiceConfig?.greeting || `Hello! Thank you for calling ${tenant.name}. How can I help you today?`,
      personality: voiceConfig?.voicePersonality || 'professional',
      systemPrompt: prompt,
    };
  }
}
