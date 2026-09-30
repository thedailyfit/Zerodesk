import { Controller, Get, Query, UseGuards, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InternalVoiceGuard } from '../../common/guards/internal-voice.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { resolveRuntimeSettings } from './runtime-settings';
import { voiceInstructions } from './voice-instructions';

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
  async getVoicePrompt(@TenantId() tenantId: string) {

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant not found: ${tenantId}`);
    }

    const voiceConfig = await this.prisma.voiceConfig.findUnique({ where: { tenantId } });
    if (!voiceConfig?.isActive) throw new ServiceUnavailableException('Voice configuration is inactive');
    const runtime = await resolveRuntimeSettings(this.prisma, tenant, 'voice');
    const prompt = this.promptService.getSystemPrompt(tenantId, { customer: null, recentInteractions: [], appointments: [], knowledgeContext: '' } as any, tenant.industry);

    return {
      tenantId,
      clinicName: tenant.name,
      greeting: voiceConfig?.greeting || `Hello! Thank you for calling ${tenant.name}. How can I help you today?`,
      personality: voiceConfig?.voicePersonality || 'professional',
      systemPrompt: prompt + voiceInstructions(voiceConfig?.settings),
      runtime,
      language: (voiceConfig?.settings as any)?.language,
      revision: tenant.updatedAt.toISOString(),
      timezone: tenant.timezone,
      businessDate: new Intl.DateTimeFormat('en-CA', { timeZone: tenant.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
    };
  }
}
