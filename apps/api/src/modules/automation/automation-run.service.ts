import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { N8nService } from './n8n.service';
import { isDeepStrictEqual } from 'node:util';

@Injectable()
export class AutomationRunService {
  constructor(private readonly prisma: PrismaService, private readonly n8n: N8nService) {}

  validateDefinition(definition: unknown) { this.validate(definition, 64000); }

  async dispatch(tenantId: string, workflow: any, requestId: string, payload: Record<string, unknown>) {
    if (!this.n8n.hasWorkflowRoute(tenantId, workflow.id)) throw new BadRequestException('No executable route is configured for this workflow');
    this.validate(payload, 16000);
    if (['tenantId', 'workflowId', 'webhookSlug'].some(key => key in payload)) throw new BadRequestException('Reserved workflow payload field');
    this.validateDefinition(workflow.definition);
    let run: any;
    try {
      run = await this.prisma.automationRun.create({ data: { tenantId, workflowId: workflow.id, requestId, definition: workflow.definition, payload: payload as any } });
    } catch (error: any) {
      if (error.code !== 'P2002') throw error;
      const previous = await this.prisma.automationRun.findUnique({ where: { tenantId_requestId: { tenantId, requestId } } });
      if (!previous || previous.workflowId !== workflow.id || !isDeepStrictEqual(previous.payload, payload)) throw new BadRequestException('Request ID already used for a different request');
      return this.result(previous);
    }
    // Claim is durable before I/O. A crash or timeout cannot safely be retried without adapter reconciliation.
    let status = 'UNCERTAIN';
    let reason = 'Dispatch outcome requires reconciliation; automatic retry suppressed';
    try {
      const result = await this.n8n.triggerTenantWorkflow(tenantId, workflow.id, { ...payload, execution: { runId: run.id, definition: run.definition } });
      if (result.success) { status = 'ACCEPTED'; reason = 'Adapter accepted the request; action completion is not confirmed'; }
    } catch { /* Keep an ambiguous outcome, never invent delivery success. */ }
    const updated = await this.prisma.$transaction(async tx => {
      const row = await tx.automationRun.update({ where: { id: run.id }, data: { status, reason } });
      if (status === 'ACCEPTED') await tx.automationWorkflow.update({ where: { id: workflow.id, tenantId }, data: { runCount: { increment: 1 }, lastRunAt: new Date() } });
      return row;
    });
    return this.result(updated);
  }

  private result(run: any) { return { success: run.status === 'ACCEPTED', runId: run.id, status: run.status, reason: run.reason, deliveryConfirmed: false }; }

  private validate(value: unknown, limit: number) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || JSON.stringify(value).length > limit) throw new BadRequestException('Invalid or oversized workflow data');
    const walk = (object: any, depth = 0) => {
      if (depth > 32) throw new BadRequestException('Workflow data is nested too deeply');
      for (const [key, child] of Object.entries(object)) {
        if (['__proto__', 'prototype', 'constructor', 'execution'].includes(key)) throw new BadRequestException('Reserved workflow field');
        if (/^(url|webhookUrl|headers)$/i.test(key) && child && (typeof child !== 'object' || Object.keys(child).length)) throw new BadRequestException('Workflow network destinations and headers must be configured in the server adapter');
        if (/^(apiKey|apiKeys|accessToken|password|secret|authorization|emailSmtp|voiceAiKey|whatsappApiKey)$/i.test(key) && child && (typeof child !== 'object' || Object.keys(child).length)) throw new BadRequestException('Store credentials in server integration settings, not workflow data');
        if (child && typeof child === 'object') walk(child, depth + 1);
      }
    };
    walk(value);
  }
}
