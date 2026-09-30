import { BadRequestException } from '@nestjs/common';

export function validateTenantUpdate(data: any) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || JSON.stringify(data).length > 300000) throw new BadRequestException('Invalid tenant settings');
  if (data.timezone !== undefined) {
    try { new Intl.DateTimeFormat('en', { timeZone: data.timezone }).format(); } catch { throw new BadRequestException('Invalid timezone'); }
  }
  for (const key of ['name','industry','phone','city','address']) {
    if (data[key] !== undefined && (typeof data[key] !== 'string' || data[key].length > 1000)) throw new BadRequestException(`Invalid ${key}`);
  }
  if (data.logoUrl && (typeof data.logoUrl !== 'string' || data.logoUrl.length > 262144 || !/^(https:\/\/|data:image\/(png|jpeg|webp);base64,)/.test(data.logoUrl))) throw new BadRequestException('Invalid logo URL');
  const settings = data.settings;
  const allowed = ['branding','phone','city','workingHours','offerings','profile','address'];
  if (settings !== undefined && (!settings || Array.isArray(settings) || typeof settings !== 'object' || Object.keys(settings).some(k => !allowed.includes(k)))) throw new BadRequestException('Use the dedicated endpoint for private/runtime settings');
  const hours = data.workingHours ?? settings?.workingHours;
  if (hours !== undefined) {
    if (!hours || typeof hours !== 'object' || Array.isArray(hours)) throw new BadRequestException('Invalid working hours');
    for (const [day,value] of Object.entries(hours)) {
      const v = value as any;
      if (!['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].includes(day) || !v || typeof v.enabled !== 'boolean' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.end) || (v.enabled && v.start >= v.end)) throw new BadRequestException('Hours require a valid day and start before end');
    }
  }
}
