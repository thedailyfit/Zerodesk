import { TypeSafeService } from './typesafe.service';
describe('Production semantic policy outage', () => {
  const previous = process.env.NODE_ENV;
  afterEach(() => { process.env.NODE_ENV = previous; });
  it('does not authorize actions or publish unscreened chunks', async () => {
    process.env.NODE_ENV = 'production';
    const service = new TypeSafeService({} as any);
    jest.spyOn(service as any, 'evaluate').mockResolvedValue(null);
    expect(await service.validateToolCallPolicy('book', {}, {})).toMatchObject({ allowed: false });
    const results = await service.screenRagChunksParallel('query', [{ chunkId: 'a', chunkText: 'unverified' }]);
    expect(results[0].passed).toBe(false);
  });
});
