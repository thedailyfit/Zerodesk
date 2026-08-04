import { Injectable, Logger } from '@nestjs/common';
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
    try {
      const url = `${this.baseUrl}/webhook/${webhookSlug}`;
      this.logger.log(`Triggering n8n workflow [${webhookSlug}] for tenant ${tenantId}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-N8N-API-KEY': this.apiKey } : {}),
        },
        body: JSON.stringify({ tenantId, ...payload, timestamp: new Date().toISOString() }),
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

  /**
   * Deep Calendar Sync integration (Google / Outlook / Zoom).
   * Dispatches appointment created event to n8n to sync 2-way with Google Calendar & generate links.
   */
  async syncAppointmentToCalendar(payload: CalendarSyncPayload): Promise<any> {
    return this.triggerWorkflow(payload.tenantId, 'calendar-sync', payload);
  }
}
