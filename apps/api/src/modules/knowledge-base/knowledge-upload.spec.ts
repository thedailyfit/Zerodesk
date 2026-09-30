import { KnowledgeService } from './knowledge.service';
describe('Knowledge upload boundaries', () => {
  const service = new KnowledgeService({} as any, {} as any, {} as any);
  it('rejects unsupported, oversized and disguised documents before extraction', async () => {
    for (const file of [{ originalname: 'app.exe', buffer: Buffer.from('x') }, { originalname: 'fake.pdf', buffer: Buffer.from('not pdf') }, { originalname: 'huge.txt', buffer: Buffer.alloc(10 * 1024 * 1024 + 1) }]) {
      await expect(service.parseAndUploadFile('tenant', file)).rejects.toThrow();
    }
  });
});
