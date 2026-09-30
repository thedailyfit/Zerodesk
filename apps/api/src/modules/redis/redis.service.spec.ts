import { RedisService } from './redis.service';
it('distinguishes unavailable coordination from a duplicate lock', async () => {
  const redis = new RedisService({} as any);
  await expect(redis.setNx('key', 'value', 30)).rejects.toThrow('unavailable');
  (redis as any).isConnected = true;
  (redis as any).client = { set: async () => null };
  expect(await redis.setNx('key', 'value', 30)).toBe(false);
});
