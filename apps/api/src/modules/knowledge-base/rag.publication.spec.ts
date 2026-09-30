import { RagService } from './rag.service';

describe('RAG atomic publication', () => {
  const vector = new Array(1536).fill(0.1);
  const doc = { id: 'doc', tenantId: 'tenant', content: 'Verified clinic hours', version: 2, isActive: true, status: 'ACTIVE' };
  function setup() {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 'doc' }]),
      $executeRaw: jest.fn().mockResolvedValue(1),
      knowledgeDocument: { findFirst: jest.fn().mockResolvedValue({ ...doc }), update: jest.fn() },
      knowledgeChunk: { deleteMany: jest.fn() },
    };
    const prisma = { knowledgeDocument: { findFirst: jest.fn().mockResolvedValue({ ...doc }), findMany: jest.fn() },
      $transaction: jest.fn(async fn => fn(tx)) };
    const embedding = { createEmbedding: jest.fn().mockResolvedValue(vector) };
    const queue = { add: jest.fn().mockResolvedValue({ id: 'job' }) };
    return { service: new RagService(prisma as any, embedding as any, queue as any), prisma, tx, embedding, queue };
  }

  it('keeps the published corpus untouched on embedding failure', async () => {
    const { service, embedding, prisma } = setup();
    embedding.createEmbedding.mockRejectedValue(new Error('provider unavailable'));
    await expect(service.indexDocument('tenant', 'doc')).rejects.toThrow('provider unavailable');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('does not publish empty documents', async () => {
    const { service, prisma } = setup();
    prisma.knowledgeDocument.findFirst.mockResolvedValue({ ...doc, content: ' ' });
    await expect(service.indexDocument('tenant', 'doc')).rejects.toThrow('no indexable content');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each(['changed', 'deleted', 'already-published'])('does not overwrite a %s document after embedding', async mode => {
    const { service, tx } = setup();
    tx.knowledgeDocument.findFirst.mockResolvedValue(mode === 'deleted' ? null : {
      ...doc, ...(mode === 'changed' ? { content: 'New hours' } : { version: 3 }),
    });
    expect(await service.indexDocument('tenant', 'doc')).toBe(0);
    expect(tx.$executeRaw).not.toHaveBeenCalled();
    expect(tx.knowledgeChunk.deleteMany).not.toHaveBeenCalled();
  });

  it('publishes all chunks and retains the previous generation in one transaction', async () => {
    const { service, tx } = setup();
    expect(await service.indexDocument('tenant', 'doc')).toBe(1);
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.knowledgeDocument.update).toHaveBeenCalledWith(expect.objectContaining({ data: { version: 3, status: 'ACTIVE', errorMessage: null } }));
    expect(tx.knowledgeChunk.deleteMany).toHaveBeenCalledWith({ where: { documentId: 'doc', tenantId: 'tenant', version: { lt: 2 } } });
  });

  it('recovers durable pending intents through the queue', async () => {
    const { service, prisma, queue } = setup();
    prisma.knowledgeDocument.findMany.mockResolvedValue([{ id: 'doc', tenantId: 'tenant' }]);
    await service.recoverPendingIndexing();
    expect(queue.add).toHaveBeenCalledWith('index-doc', { documentId: 'doc', tenantId: 'tenant' }, expect.objectContaining({ attempts: 3, removeOnFail: true }));
  });
});
