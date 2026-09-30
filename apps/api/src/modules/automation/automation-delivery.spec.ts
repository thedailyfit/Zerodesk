import { AutomationSequenceService } from './automation-sequence.service';

describe('automation delivery receipts', () => {
  function setup(dndStatus = false) {
    const receipts = new Map<string, any>();
    const prisma: any = {
      automationDelivery: {
        create: jest.fn(async ({ data }) => { if (receipts.has(data.businessKey)) throw { code: 'P2002' }; const row = { id: data.businessKey, status: 'PENDING' }; receipts.set(row.id, row); return row; }),
        findUnique: jest.fn(async ({ where }) => receipts.get(where.tenantId_businessKey.businessKey)),
        update: jest.fn(async ({ where, data }) => Object.assign(receipts.get(where.id), data)),
      },
      customer: { findFirst: jest.fn(async () => ({ id: 'customer', phone: '+919123456789', dndStatus })) },
      patientConsent: { findFirst: jest.fn(async () => ({ status: 'GRANTED' })) },
      appointment: { updateMany: jest.fn() },
    };
    prisma.$transaction = async (fn: any) => fn(prisma);
    const whatsapp = { sendMessage: jest.fn(async () => ({ messages: [{ id: 'provider-id' }] })) };
    return { service: new AutomationSequenceService(prisma, whatsapp as any) as any, prisma, whatsapp };
  }
  it('suppresses duplicate sends and marks reminders only after a provider receipt', async () => {
    const { service, prisma, whatsapp } = setup();
    expect(await service.deliver('a', 'REMINDER:1', { id: 'customer' }, 'message', 'appointment')).toMatchObject({ status: 'sent' });
    await service.deliver('a', 'REMINDER:1', { id: 'customer' }, 'message', 'appointment');
    expect(whatsapp.sendMessage).toHaveBeenCalledTimes(1);
    expect(prisma.appointment.updateMany).toHaveBeenCalledWith({ where: { id: 'appointment', tenantId: 'a' }, data: { reminderSent: true } });
  });
  it('does not send or mark opted-out recipients', async () => {
    const { service, prisma, whatsapp } = setup(true);
    expect(await service.deliver('a', 'REMINDER:1', { id: 'customer' }, 'message', 'appointment')).toMatchObject({ status: 'skipped' });
    expect(whatsapp.sendMessage).not.toHaveBeenCalled();
    expect(prisma.appointment.updateMany).not.toHaveBeenCalled();
  });
  it('keeps ambiguous provider failure uncertain and suppresses unsafe retry', async () => {
    const { service, prisma, whatsapp } = setup();
    whatsapp.sendMessage.mockRejectedValue(new Error('timeout'));
    expect(await service.deliver('a', 'REMINDER:1', { id: 'customer' }, 'message', 'appointment')).toMatchObject({ status: 'uncertain' });
    await service.deliver('a', 'REMINDER:1', { id: 'customer' }, 'message', 'appointment');
    expect(whatsapp.sendMessage).toHaveBeenCalledTimes(1);
    expect(prisma.appointment.updateMany).not.toHaveBeenCalled();
  });
});
