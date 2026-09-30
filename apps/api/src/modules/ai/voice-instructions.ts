import { BadRequestException } from '@nestjs/common';

export function voiceInstructions(settings: any): string {
  if (!settings || typeof settings !== 'object') return '';
  const instructions = [settings.systemPrompt, settings.tone,
    ...(Array.isArray(settings.rules) ? settings.rules.filter((r: any) => r.active === true).map((r: any) => r.text) : [])];
  return '\nWorkspace instructions:\n' + instructions.filter(x => typeof x === 'string').join('\n').slice(0, 20000);
}

export function validateVoiceInstructions(settings: any) {
  for (const field of ['systemPrompt', 'tone']) {
    if (settings?.[field] !== undefined && (typeof settings[field] !== 'string' || settings[field].length > (field === 'tone' ? 1000 : 12000))) throw new BadRequestException(`Invalid ${field}`);
  }
  if (settings?.rules !== undefined && (!Array.isArray(settings.rules) || settings.rules.length > 50 || settings.rules.some((r: any) => !r || typeof r.text !== 'string' || r.text.length > 1000 || typeof r.active !== 'boolean'))) throw new BadRequestException('Invalid voice rules');
}
