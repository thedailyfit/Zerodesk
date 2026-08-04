import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export type VoiceProvider = 'vapi' | 'retell';

export interface VoiceCallEvent {
  provider: VoiceProvider;
  callId: string;
  type: string;
  tenantId?: string;
  phoneNumber?: string;
  transcript?: string;
  duration?: number;
  status?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get voice config for a tenant.
   */
  async getConfig(tenantId: string) {
    return this.prisma.voiceConfig.findUnique({
      where: { tenantId },
    });
  }

  /**
   * Create or update voice config.
   */
  async updateConfig(tenantId: string, data: any) {
    return this.prisma.voiceConfig.upsert({
      where: { tenantId },
      update: data,
      create: { ...data, tenantId },
    });
  }

  // ========================================
  // VAPI INTEGRATION
  // ========================================

  /**
   * Handle incoming Vapi webhook events.
   * Events: call.started, call.ended, call.ringing, transcript.partial, transcript.final,
   *         function_call, hang, speech-update, status-update
   */
  async handleVapiWebhook(payload: any): Promise<any> {
    const eventType = payload.message?.type || payload.type;
    this.logger.log(`Vapi webhook: ${eventType}`);

    switch (eventType) {
      case 'assistant-request':
        return this.handleVapiAssistantRequest(payload);

      case 'function-call':
        return this.handleVapiFunctionCall(payload);

      case 'end-of-call-report':
        return this.handleVapiCallEnd(payload);

      case 'status-update':
        this.logger.log(`Call status: ${payload.message?.status}`);
        return { status: 'ok' };

      case 'transcript': {
        const transcriptText = payload.message?.transcript || '';
        const callId = payload.message?.call?.id;
        const role = payload.message?.role;

        // Emit real-time transcript event for UI streaming
        this.eventEmitter.emit('voice.transcript', {
          callId,
          transcript: transcriptText,
          role,
        });

        // Real-time Interrupt & Anger Detection
        if (role === 'user' && transcriptText) {
          const lowerText = transcriptText.toLowerCase();
          const angryKeywords = ['stop talking', 'human', 'agent', 'manager', 'angry', 'shut up', 'supervisor', 'complaint', 'useless'];
          const isAngry = angryKeywords.some((kw) => lowerText.includes(kw));

          if (isAngry) {
            this.logger.warn(`Aggressive sentiment / Interrupt keyword detected on call ${callId}. Triggering auto-transfer!`);
            this.eventEmitter.emit('voice.transfer', {
              callId,
              reason: 'Aggressive sentiment / Customer requested human transfer',
              transcript: transcriptText,
            });

            return {
              result: 'I understand your frustration. Connecting you to a manager immediately.',
              shouldTransfer: true,
            };
          }
        }
        return { status: 'ok' };
      }

      default:
        this.logger.warn(`Unhandled Vapi event: ${eventType}`);
        return { status: 'ok' };
    }
  }

  /**
   * Vapi assistant-request: dynamically configure the AI assistant per tenant.
   */
  private async handleVapiAssistantRequest(payload: any) {
    const phoneNumber = payload.message?.call?.customer?.number;
    const tenantConfig = await this.findTenantByPhone(phoneNumber, 'vapi');

    if (!tenantConfig) {
      return {
        assistant: {
          firstMessage: 'Hello, thank you for calling. How can I help you today?',
          model: { provider: 'openai', model: 'gpt-4o-mini' },
          voice: { provider: 'playht', voiceId: 'jennifer' },
        },
      };
    }

    const voiceConfig = await this.getConfig(tenantConfig.id);
    const tenant = tenantConfig;

    return {
      assistant: {
        firstMessage: voiceConfig?.greeting || `Hello! Welcome to ${tenant.name}. How can I help you?`,
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          systemMessage: this.buildVoiceSystemPrompt(tenant, voiceConfig),
          functions: this.getVoiceFunctions(),
        },
        voice: {
          provider: 'playht',
          voiceId: this.getVoiceId(voiceConfig?.voicePersonality || 'professional'),
        },
        recordingEnabled: true,
        endCallFunctionEnabled: true,
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: voiceConfig?.languages?.[0] || 'en',
        },
      },
    };
  }

  /**
   * Handle Vapi function calls (booking, pricing, etc.).
   */
  private async handleVapiFunctionCall(payload: any) {
    const functionCall = payload.message?.functionCall;
    const callId = payload.message?.call?.id;

    this.logger.log(`Vapi function call: ${functionCall?.name}`);

    switch (functionCall?.name) {
      case 'bookAppointment':
        this.eventEmitter.emit('voice.action', {
          type: 'BOOK_APPOINTMENT',
          callId,
          params: functionCall.parameters,
        });
        return { result: 'Appointment has been booked successfully. I will send a confirmation via WhatsApp.' };

      case 'checkAvailability':
        return { result: 'We have slots available at 10 AM, 2 PM, and 4 PM today, and 11 AM tomorrow.' };

      case 'getPricing':
        return { result: 'I can share our treatment pricing. What specific service are you interested in?' };

      case 'transferToHuman':
        this.eventEmitter.emit('voice.transfer', { callId, reason: functionCall.parameters?.reason });
        return { result: 'I am now connecting you to a team member. Please hold.' };

      default:
        return { result: 'I will look into that for you.' };
    }
  }

  /**
   * Handle end-of-call report from Vapi.
   */
  private async handleVapiCallEnd(payload: any) {
    const report = payload.message;
    const event: VoiceCallEvent = {
      provider: 'vapi',
      callId: report.call?.id || '',
      type: 'CALL_ENDED',
      phoneNumber: report.call?.customer?.number,
      transcript: report.transcript,
      duration: report.durationSeconds,
      status: report.endedReason,
      metadata: {
        cost: report.cost,
        summary: report.summary,
        recordingUrl: report.recordingUrl,
      },
    };

    this.eventEmitter.emit('voice.call.ended', event);
    return { status: 'ok' };
  }

  // ========================================
  // RETELL AI INTEGRATION
  // ========================================

  /**
   * Handle incoming Retell AI webhook events.
   */
  async handleRetellWebhook(payload: any): Promise<any> {
    const eventType = payload.event;
    this.logger.log(`Retell webhook: ${eventType}`);

    switch (eventType) {
      case 'call_started':
        this.eventEmitter.emit('voice.call.started', {
          provider: 'retell',
          callId: payload.call?.call_id,
          phoneNumber: payload.call?.from_number,
        });
        return { status: 'ok' };

      case 'call_ended':
        const event: VoiceCallEvent = {
          provider: 'retell',
          callId: payload.call?.call_id || '',
          type: 'CALL_ENDED',
          phoneNumber: payload.call?.from_number,
          transcript: payload.call?.transcript,
          duration: payload.call?.duration_ms ? Math.floor(payload.call.duration_ms / 1000) : 0,
          status: payload.call?.disconnection_reason,
          metadata: {
            recordingUrl: payload.call?.recording_url,
            sentiment: payload.call?.call_analysis?.user_sentiment,
            summary: payload.call?.call_analysis?.call_summary,
          },
        };
        this.eventEmitter.emit('voice.call.ended', event);
        return { status: 'ok' };

      case 'call_analyzed':
        this.logger.log(`Call analysis: ${JSON.stringify(payload.call?.call_analysis)}`);
        return { status: 'ok' };

      default:
        this.logger.warn(`Unhandled Retell event: ${eventType}`);
        return { status: 'ok' };
    }
  }

  /**
   * Create a Retell AI agent for a tenant.
   */
  async createRetellAgent(tenantId: string): Promise<any> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const voiceConfig = await this.getConfig(tenantId);

    const retellApiKey = this.configService.get('RETELL_API_KEY');
    const response = await fetch('https://api.retellai.com/v2/create-agent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_name: `${tenant?.name || 'ZeroDesk'} AI Assistant`,
        voice_id: this.getRetellVoiceId(voiceConfig?.voicePersonality || 'professional'),
        language: voiceConfig?.languages?.[0] || 'en',
        begin_message: voiceConfig?.greeting || `Hello! Welcome to ${tenant?.name}. How can I help you?`,
        general_prompt: this.buildVoiceSystemPrompt(tenant, voiceConfig),
        enable_backchannel: true,
        ambient_sound: 'office',
      }),
    });

    return response.json();
  }

  // ========================================
  // COMMON HELPERS
  // ========================================

  /**
   * Initiate an outbound call via the tenant's configured provider.
   */
  async initiateOutboundCall(tenantId: string, phoneNumber: string, purpose?: string) {
    const voiceConfig = await this.getConfig(tenantId);
    const provider = voiceConfig?.settings
      ? (voiceConfig.settings as any).provider || 'vapi'
      : 'vapi';

    this.logger.log(`Initiating ${provider} outbound call: ${tenantId} → ${phoneNumber}`);

    if (provider === 'retell') {
      const retellApiKey = this.configService.get('RETELL_API_KEY');
      const response = await fetch('https://api.retellai.com/v2/create-phone-call', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${retellApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_number: voiceConfig?.vapiPhoneNumber,
          to_number: phoneNumber,
          agent_id: (voiceConfig?.settings as any)?.retellAgentId,
        }),
      });
      return response.json();
    } else {
      // Vapi outbound
      const vapiApiKey = this.configService.get('VAPI_API_KEY');
      const response = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${vapiApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: voiceConfig?.vapiAssistantId,
          customer: { number: phoneNumber },
          phoneNumberId: voiceConfig?.vapiPhoneNumber,
        }),
      });
      return response.json();
    }
  }

  /**
   * Get call history for a tenant.
   */
  async getCallHistory(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [calls, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: { tenantId, channel: 'VOICE' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: { select: { name: true, phone: true } },
        },
      }),
      this.prisma.conversation.count({
        where: { tenantId, channel: 'VOICE' },
      }),
    ]);

    return { calls, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ========================================
  // PRIVATE HELPERS
  // ========================================

  private async findTenantByPhone(phone: string | undefined, provider: VoiceProvider) {
    if (!phone) return null;
    const config = await this.prisma.voiceConfig.findFirst({
      where: { vapiPhoneNumber: phone, isActive: true },
      include: { tenant: true },
    });
    return config?.tenant || null;
  }

  private buildVoiceSystemPrompt(tenant: any, voiceConfig: any): string {
    return `You are an AI receptionist for ${tenant?.name || 'our business'}.
Industry: ${tenant?.industry || 'general'}
Your role: Answer calls professionally, book appointments, provide pricing info, and handle customer queries.
Personality: ${voiceConfig?.voicePersonality || 'professional'}

RULES:
- Always be helpful and courteous
- If you cannot answer a question, offer to transfer to a human
- For appointment booking, always confirm date, time, and service
- Never share internal business data or other customers' information
- If the caller is angry or distressed, remain calm and empathetic
- Speak naturally, use short sentences for voice clarity`;
  }

  private getVoiceFunctions() {
    return [
      {
        name: 'bookAppointment',
        description: 'Book an appointment for the caller',
        parameters: {
          type: 'object',
          properties: {
            service: { type: 'string', description: 'The service or treatment name' },
            date: { type: 'string', description: 'Preferred date (YYYY-MM-DD)' },
            time: { type: 'string', description: 'Preferred time (HH:MM)' },
            customerName: { type: 'string', description: 'Caller name' },
          },
          required: ['service'],
        },
      },
      {
        name: 'checkAvailability',
        description: 'Check available appointment slots',
        parameters: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'Date to check (YYYY-MM-DD)' },
            service: { type: 'string', description: 'Service name' },
          },
        },
      },
      {
        name: 'getPricing',
        description: 'Get pricing for a service',
        parameters: {
          type: 'object',
          properties: {
            service: { type: 'string', description: 'Service to get pricing for' },
          },
        },
      },
      {
        name: 'transferToHuman',
        description: 'Transfer the call to a human agent',
        parameters: {
          type: 'object',
          properties: {
            reason: { type: 'string', description: 'Reason for transfer' },
          },
        },
      },
    ];
  }

  private getVoiceId(personality: string): string {
    const voiceMap: Record<string, string> = {
      receptionist: 'jennifer',
      luxury: 'charlotte',
      corporate: 'davis',
      professional: 'sarah',
      friendly: 'aria',
      doctor_assistant: 'emma',
    };
    return voiceMap[personality] || 'sarah';
  }

  private getRetellVoiceId(personality: string): string {
    const voiceMap: Record<string, string> = {
      receptionist: '11labs-Adrian',
      luxury: '11labs-Dorothy',
      corporate: '11labs-Marissa',
      professional: '11labs-Adrian',
      friendly: '11labs-Luna',
      doctor_assistant: '11labs-Dorothy',
    };
    return voiceMap[personality] || '11labs-Adrian';
  }
}
