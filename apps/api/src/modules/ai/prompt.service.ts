import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomerContext } from './context.service';

@Injectable()
export class PromptService {
  constructor(private prisma: PrismaService) {}

  /**
   * Build a dynamic system prompt based on industry, tenant config, and customer context.
   */
  getSystemPrompt(tenantId: string, context: CustomerContext): string {
    const { customer, recentInteractions, appointments, knowledgeContext } = context;

    const customerSection = customer
      ? `
## Customer Profile
- Name: ${customer.name || 'Unknown'}
- Phone: ${customer.phone || 'Unknown'}
- Email: ${customer.email || 'Unknown'}
- Language Preference: ${customer.language}
- Lead Score: ${customer.leadScore}/100
- Sentiment: ${customer.sentiment || 'Unknown'}
- Lifetime Value: ₹${customer.lifetimeValue}
- Tags: ${customer.tags.join(', ') || 'None'}
- Previous Summary: ${customer.aiSummary || 'No previous interactions recorded'}
- Customer Since: ${customer.firstSeenAt.toLocaleDateString('en-IN')}
- Last Active: ${customer.lastSeenAt.toLocaleDateString('en-IN')}
`
      : '## Customer Profile\nNew customer — no previous interactions.\n';

    const interactionsSection = recentInteractions.length > 0
      ? `
## Recent Interactions (Last ${recentInteractions.length})
${recentInteractions.map((i) => `- [${i.channel}] ${i.summary || 'No summary'} (Sentiment: ${i.sentiment || 'N/A'})`).join('\n')}
`
      : '';

    const appointmentsSection = appointments.length > 0
      ? `
## Upcoming/Recent Appointments
${appointments.map((a) => `- ${a.serviceName || 'General'} with ${a.staffName || 'Staff'} on ${a.scheduledAt.toLocaleDateString('en-IN')} — Status: ${a.status}`).join('\n')}
`
      : '';

    return `${this.getIndustryPrompt()}

${customerSection}

${interactionsSection}

${appointmentsSection}

${knowledgeContext ? `\n${knowledgeContext}\n` : ''}

## Response Guidelines
You MUST respond in valid JSON with this structure:
{
  "response": "Your natural language response to the customer",
  "intent": "BOOKING | INQUIRY | COMPLAINT | FOLLOW_UP | PRICING | GENERAL | EMERGENCY",
  "actions": [
    { "type": "BOOK_APPOINTMENT | CREATE_LEAD | UPDATE_CUSTOMER | TRANSFER | SEND_TEMPLATE | NONE", "params": {} }
  ],
  "shouldTransfer": false,
  "confidence": 0.95
}

## Rules
1. Be concise, professional, and helpful
2. Use the customer's name if available
3. Reference their history when relevant
4. If you detect high-value intent (appointment booking, premium services), set confidence high
5. If you cannot resolve the query, set shouldTransfer to true
6. For appointment bookings, extract date, time, and service into actions
7. For complaints, acknowledge the issue and set shouldTransfer to true
8. Respond in the customer's preferred language (${customer?.language || 'en'})
9. Never share other customers' data
10. Include appropriate actions array based on the conversation
`;
  }

  /**
   * Industry-specific base prompt.
   */
  private getIndustryPrompt(): string {
    // This would dynamically load based on tenant industry
    // For now, return a comprehensive general prompt
    return `# ZeroDesk AI Assistant

You are an AI front desk assistant for a service business. You handle customer inquiries across voice calls, WhatsApp messages, and web chat.

Your capabilities:
- **Appointment Booking**: Check availability, book/reschedule/cancel appointments
- **Service Information**: Provide details about services, treatments, pricing
- **FAQ Handling**: Answer frequently asked questions using the knowledge base
- **Lead Capture**: Collect contact information from interested customers
- **Complaint Handling**: Acknowledge issues and escalate to human agents
- **Follow-ups**: Remember context from previous conversations

You represent the business as a knowledgeable, friendly, and efficient front desk professional.`;
  }

  /**
   * Get industry-specific system prompt template.
   */
  getIndustryTemplate(industry: string): string {
    const templates: Record<string, string> = {
      'hospital': `You are an AI receptionist for a hospital/medical clinic. 
Key focus: Patient scheduling, doctor availability, emergency triage questions.
IMPORTANT: Never provide medical advice. For emergencies, immediately advise calling 108/112.
Tone: Calm, reassuring, precise.`,

      'skin_hair_clinic': `You are an AI receptionist for a skin & hair clinic.
Key focus: Treatment inquiries, pricing, doctor consultation booking, post-treatment care info.
Tone: Professional, knowledgeable about dermatology/cosmetology services.`,

      'spa_wellness': `You are an AI receptionist for a spa & wellness center.
Key focus: Spa package inquiries, couples bookings, membership information, therapist availability.
Tone: Warm, relaxing, luxurious.`,

      'hotel_resort': `You are an AI front desk for a hotel/resort.
Key focus: Room availability, reservation management, check-in/out info, amenities, local attractions.
Tone: Hospitable, accommodating, premium service.`,

      'real_estate': `You are an AI assistant for a real estate agency.
Key focus: Property inquiries, site visit scheduling, price discussions, locality information.
Tone: Professional, knowledgeable about real estate market.`,
    };

    return templates[industry] || templates['skin_hair_clinic'];
  }
}
