import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PlivoNumberInfo {
  phoneNumber: string;
  type: string;
  country: string;
  monthlyCostInr: number;
  provider: string;
}

@Injectable()
export class PlivoService {
  private readonly logger = new Logger(PlivoService.name);
  private authId: string;
  private authToken: string;
  private appId: string;
  private livekitSipDomain: string;

  constructor(private configService: ConfigService) {
    this.authId = this.configService.get('PLIVO_AUTH_ID', '');
    this.authToken = this.configService.get('PLIVO_AUTH_TOKEN', '');
    this.appId = this.configService.get('PLIVO_APP_ID', '');
    this.livekitSipDomain = this.configService.get('LIVEKIT_SIP_DOMAIN', 'sip.livekit.cloud');
  }

  /**
   * Search for available phone numbers via Plivo REST API.
   */
  async searchNumbers(country = 'IN', type = 'local'): Promise<PlivoNumberInfo[]> {
    if (!this.authId || !this.authToken || this.authId.startsWith('MAYxxx')) {
      // Deterministic fallback list for development & testing
      return [
        { phoneNumber: '+918047361920', type: 'LOCAL_VMN', country: 'IN', monthlyCostInr: 799, provider: 'Plivo' },
        { phoneNumber: '+918047361921', type: 'LOCAL_VMN', country: 'IN', monthlyCostInr: 799, provider: 'Plivo' },
        { phoneNumber: '+914048927110', type: 'LOCAL_VMN', country: 'IN', monthlyCostInr: 899, provider: 'Plivo' },
        { phoneNumber: '+9118002081990', type: 'TOLL_FREE', country: 'IN', monthlyCostInr: 1499, provider: 'Plivo' },
      ];
    }

    try {
      const url = `https://api.plivo.com/v1/Account/${this.authId}/PhoneNumber/?country_iso=${country}&type=${type}`;
      const res = await fetch(url, {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${this.authId}:${this.authToken}`).toString('base64'),
        },
      });

      if (!res.ok) {
        this.logger.warn(`Plivo number search returned ${res.status}. Using fallback pool.`);
        return this.getFallbackNumbers();
      }

      const data = await res.json();
      const objects = data.objects || [];
      return objects.map((obj: any) => ({
        phoneNumber: obj.number.startsWith('+') ? obj.number : `+${obj.number}`,
        type: obj.type || 'LOCAL',
        country: obj.country || country,
        monthlyCostInr: Math.round((parseFloat(obj.monthly_rental_rate || '10') * 85)),
        provider: 'Plivo',
      }));
    } catch (err: any) {
      this.logger.error(`Plivo search error: ${err.message}`);
      return this.getFallbackNumbers();
    }
  }

  /**
   * Purchase a virtual phone number via Plivo REST API.
   */
  async purchaseNumber(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    if (!this.authId || !this.authToken || this.authId.startsWith('MAYxxx')) {
      this.logger.log(`[DEV MOCK] Simulated Plivo number purchase for ${phoneNumber}`);
      return { success: true, message: `Number ${phoneNumber} provisioned via Plivo (Sandbox)` };
    }

    try {
      const clean = phoneNumber.replace(/[^0-9]/g, '');
      const url = `https://api.plivo.com/v1/Account/${this.authId}/PhoneNumber/${clean}/`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${this.authId}:${this.authToken}`).toString('base64'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: this.appId || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Plivo purchase failed (${res.status}): ${text}`);
      }

      return { success: true, message: `Successfully provisioned ${phoneNumber} via Plivo` };
    } catch (err: any) {
      this.logger.error(`Plivo purchase error: ${err.message}`);
      throw err;
    }
  }

  /**
   * Generate Plivo XML to forward inbound PSTN call to LiveKit Cloud SIP trunk.
   * If LiveKit does not answer within 15 seconds, Plivo falls back to Retell AI.
   */
  generateInboundXml(calledNumber: string, tenantId: string, apiBaseUrl: string): string {
    const cleanCalled = calledNumber.replace(/[^0-9+]/g, '');
    const fallbackAction = `${apiBaseUrl}/v1/voice/plivo-fallback?called=${encodeURIComponent(cleanCalled)}&tenantId=${tenantId}`;
    const sipUri = `sip:${cleanCalled}@${this.livekitSipDomain}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial timeout="15" action="${fallbackAction}" method="POST">
        <Sip>${sipUri}</Sip>
    </Dial>
</Response>`.trim();
  }

  /**
   * Generate Plivo XML for secondary fallback to Retell AI or clinic emergency transfer.
   */
  generateFallbackXml(retellPhoneNumber?: string, transferNumber?: string): string {
    if (retellPhoneNumber) {
      const cleanRetell = retellPhoneNumber.replace(/[^0-9+]/g, '');
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial timeout="25">
        <Number>${cleanRetell}</Number>
    </Dial>
</Response>`.trim();
    }

    if (transferNumber) {
      const cleanTransfer = transferNumber.replace(/[^0-9+]/g, '');
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial timeout="30">
        <Number>${cleanTransfer}</Number>
    </Dial>
</Response>`.trim();
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak>We apologize, our receptionist is currently unavailable. Please visit our website or WhatsApp us to book an appointment.</Speak>
</Response>`.trim();
  }

  private getFallbackNumbers(): PlivoNumberInfo[] {
    return [
      { phoneNumber: '+918047361920', type: 'LOCAL_VMN', country: 'IN', monthlyCostInr: 799, provider: 'Plivo' },
      { phoneNumber: '+918047361921', type: 'LOCAL_VMN', country: 'IN', monthlyCostInr: 799, provider: 'Plivo' },
      { phoneNumber: '+914048927110', type: 'LOCAL_VMN', country: 'IN', monthlyCostInr: 899, provider: 'Plivo' },
      { phoneNumber: '+9118002081990', type: 'TOLL_FREE', country: 'IN', monthlyCostInr: 1499, provider: 'Plivo' },
    ];
  }
}
