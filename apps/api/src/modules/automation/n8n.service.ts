import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CalendarSyncPayload {
  tenantId: string;
  appointmentId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceName: string;
  scheduledAt: Date;
  durationMins: number;
}

@Injectable()
export class N8nService {
  private readonly logger = new Logger(N8nService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get('N8N_BASE_URL', 'http://localhost:5678');
    this.apiKey = this.configService.get('N8N_API_KEY', '');
  }

  /**
   * Generic n8n workflow trigger via webhook.
   */
  async triggerWorkflow(tenantId: string, webhookSlug: string, payload: any): Promise<any> {
    if (!tenantId || !/^[a-zA-Z0-9_-]{1,120}$/.test(webhookSlug || '')) throw new BadRequestException('Invalid workflow route');
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new BadRequestException('Invalid workflow payload');
    if (this.configService.get('NODE_ENV') === 'production' && (!this.baseUrl.startsWith('https://') || !this.apiKey)) throw new BadRequestException('Production workflow adapter requires HTTPS and authentication');
    try {
      const url = `${this.baseUrl}/webhook/${webhookSlug}`;
      this.logger.log(`Triggering n8n workflow [${webhookSlug}] for tenant ${tenantId}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-N8N-API-KEY': this.apiKey } : {}),
        },
        body: JSON.stringify({ ...payload, tenantId, timestamp: new Date().toISOString() }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        this.logger.warn(`n8n webhook ${webhookSlug} returned status ${response.status}`);
      }

      return { success: response.ok, status: response.status };
    } catch (error) {
      this.logger.error(`Failed to trigger n8n workflow ${webhookSlug}: ${error}`);
      return { success: false, error: String(error) };
    }
  }

  hasWorkflowRoute(tenantId: string, workflowId: string): boolean {
    try {
      const routes = JSON.parse(this.configService.get('N8N_WORKFLOW_ROUTES', '{}'));
      const route = routes?.[tenantId]?.[workflowId];
      return typeof route === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(route);
    } catch { return false; }
  }

  async triggerTenantWorkflow(tenantId: string, workflowId: string, payload: Record<string, unknown>) {
    // Only deployment-owned routes can reach n8n; editable workflow definitions cannot choose a webhook.
    let routes: Record<string, Record<string, string>>;
    try { routes = JSON.parse(this.configService.get('N8N_WORKFLOW_ROUTES', '{}')); }
    catch { return { success: false, status: 'unavailable', reason: 'Workflow routing is not configured' }; }
    const route = routes?.[tenantId]?.[workflowId];
    if (!route) return { success: false, status: 'unavailable', reason: 'No executable route is configured for this workflow' };
    if (Object.keys(payload).some((key) => ['tenantId', 'workflowId', 'webhookSlug', '__proto__', 'constructor', 'prototype'].includes(key))) throw new BadRequestException('Reserved workflow payload field');
    if (JSON.stringify(payload).length > 82000) throw new BadRequestException('Workflow payload too large');
    return this.triggerWorkflow(tenantId, route, payload);
  }

  /**
   * Deep Calendar Sync integration (Google / Outlook / Zoom).
   * Dispatches appointment created event to n8n to sync 2-way with Google Calendar & generate links.
   */
  async syncAppointmentToCalendar(payload: CalendarSyncPayload): Promise<any> {
    return this.triggerWorkflow(payload.tenantId, 'calendar-sync', payload);
  }
}
