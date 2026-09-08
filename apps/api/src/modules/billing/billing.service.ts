import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

export interface PlanLimits {
  llmTokensLimit: number;
  voiceMinutesLimit: number;
  whatsappMessagesLimit: number;
  mrr: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    llmTokensLimit: 2_000_000,
    voiceMinutesLimit: 300,
    whatsappMessagesLimit: 1_500,
    mrr: 14999,
  },
  pro: {
    llmTokensLimit: 5_000_000,
    voiceMinutesLimit: 1_000,
    whatsappMessagesLimit: 5_000,
    mrr: 24999,
  },
  enterprise: {
    llmTokensLimit: 20_000_000,
    voiceMinutesLimit: 3_000,
    whatsappMessagesLimit: 20_000,
    mrr: 49999,
  },
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not set. Running Stripe billing in sandbox mock mode.');
    }
  }

  /**
   * Create a Stripe Checkout session for subscription upgrade or renewal.
   */
  async createCheckoutSession(
    tenantId: string,
    plan: string,
    successUrl?: string,
    cancelUrl?: string,
  ) {
    const normalizedPlan = plan.toLowerCase();
    const planConfig = PLAN_LIMITS[normalizedPlan] || PLAN_LIMITS['starter'];

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    const appUrl = this.configService.get<string>('APP_URL') || 'https://app.zerodesk.in';
    const finalSuccessUrl = successUrl || `${appUrl}/settings/billing?session_id={CHECKOUT_SESSION_ID}&status=success`;
    const finalCancelUrl = cancelUrl || `${appUrl}/settings/billing?status=cancelled`;

    if (!this.stripe) {
      // Mock flow when running without live Stripe keys
      this.logger.log(`Mocking Stripe checkout session for tenant ${tenantId} on plan ${normalizedPlan}`);
      await this.activateSubscription(tenantId, normalizedPlan, 'mock_sub_' + Date.now(), 'mock_cust_' + Date.now());
      return {
        url: finalSuccessUrl.replace('{CHECKOUT_SESSION_ID}', 'mock_session_id'),
        sessionId: 'mock_session_id',
        mode: 'mock',
      };
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        client_reference_id: tenantId,
        metadata: {
          tenantId,
          plan: normalizedPlan,
        },
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `ZeroDesk ${normalizedPlan.toUpperCase()} Plan`,
                description: `Voice AI + WhatsApp AI Receptionist (${planConfig.voiceMinutesLimit} mins, ${planConfig.whatsappMessagesLimit} WhatsApp msgs, ${(planConfig.llmTokensLimit / 1_000_000).toFixed(0)}M tokens)`,
              },
              unit_amount: planConfig.mrr * 100, // in paise
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl,
      });

      return {
        url: session.url,
        sessionId: session.id,
        mode: 'stripe',
      };
    } catch (err: any) {
      this.logger.error(`Stripe checkout session creation failed: ${err.message}`);
      throw new BadRequestException(`Failed to create billing session: ${err.message}`);
    }
  }

  /**
   * Handle incoming Stripe webhook notifications with cryptographic signature verification.
   */
  async handleWebhook(rawBody: string | Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!this.stripe || !webhookSecret) {
      this.logger.warn('Stripe or STRIPE_WEBHOOK_SECRET not configured. Skipping signature verification.');
      return { received: true };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Stripe webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received verified Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId || session.client_reference_id;
        const plan = session.metadata?.plan || 'starter';
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        const custId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

        if (tenantId) {
          await this.activateSubscription(tenantId, plan, subId || null, custId || null);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (subId) {
          // Reset usage counters for new billing period
          await this.prisma.subscription.updateMany({
            where: { stripeSubId: subId },
            data: {
              voiceMinutesUsed: 0,
              whatsappMessagesUsed: 0,
              llmTokensUsed: 0,
              status: 'active',
              updatedAt: new Date(),
            },
          });
          this.logger.log(`Reset usage metrics for renewed subscription ${subId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.prisma.subscription.updateMany({
          where: { stripeSubId: sub.id },
          data: { status: 'canceled', updatedAt: new Date() },
        });
        this.logger.warn(`Marked subscription ${sub.id} as canceled`);
        break;
      }

      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Activate or upgrade tenant subscription in database.
   */
  private async activateSubscription(
    tenantId: string,
    plan: string,
    stripeSubId: string | null,
    stripeCustId: string | null,
  ) {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS['starter'];

    await this.prisma.subscription.upsert({
      where: { tenantId },
      update: {
        plan,
        stripeSubId,
        stripeCustId,
        mrr: limits.mrr,
        voiceMinutesLimit: limits.voiceMinutesLimit,
        whatsappMessagesLimit: limits.whatsappMessagesLimit,
        llmTokensLimit: limits.llmTokensLimit,
        status: 'active',
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        plan,
        stripeSubId,
        stripeCustId,
        mrr: limits.mrr,
        voiceMinutesLimit: limits.voiceMinutesLimit,
        whatsappMessagesLimit: limits.whatsappMessagesLimit,
        llmTokensLimit: limits.llmTokensLimit,
        status: 'active',
      },
    });

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionTier: plan,
        subscriptionStatus: 'active',
      },
    });

    this.logger.log(`Activated ${plan} plan for tenant ${tenantId}`);
  }

  /**
   * Get subscription and usage statistics for tenant.
   */
  async getSubscription(tenantId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!sub) {
      return {
        plan: 'trial',
        status: 'active',
        voiceMinutes: { used: 0, limit: 100, pct: 0 },
        whatsappMessages: { used: 0, limit: 500, pct: 0 },
        llmTokens: { used: 0, limit: 1_000_000, pct: 0 },
      };
    }

    return {
      id: sub.id,
      plan: sub.plan,
      status: sub.status,
      mrr: Number(sub.mrr),
      voiceMinutes: {
        used: sub.voiceMinutesUsed,
        limit: sub.voiceMinutesLimit,
        pct: Math.min(100, Math.round((sub.voiceMinutesUsed / (sub.voiceMinutesLimit || 1)) * 100)),
      },
      whatsappMessages: {
        used: sub.whatsappMessagesUsed,
        limit: sub.whatsappMessagesLimit,
        pct: Math.min(100, Math.round((sub.whatsappMessagesUsed / (sub.whatsappMessagesLimit || 1)) * 100)),
      },
      llmTokens: {
        used: sub.llmTokensUsed,
        limit: sub.llmTokensLimit,
        pct: Math.min(100, Math.round((sub.llmTokensUsed / (sub.llmTokensLimit || 1)) * 100)),
      },
    };
  }
}
