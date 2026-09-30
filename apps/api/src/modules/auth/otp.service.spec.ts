import { OtpService } from './otp.service';
describe('OTP delivery integrity', () => {
  it('rejects skipped delivery and removes the unusable code', async () => {
    const redis = { setNx: jest.fn().mockResolvedValue(true), set: jest.fn().mockResolvedValue('OK'), del: jest.fn() };
    const service = new OtpService(redis as any, { sendMessage: jest.fn().mockResolvedValue({ success: false }) } as any);
    await expect(service.generateAndSendOtp('t', '+919876543210', 'Business')).rejects.toThrow('could not be sent');
    expect(redis.del).toHaveBeenCalledTimes(2);
    expect(redis.set.mock.calls[0][1]).toMatch(/^[a-f0-9]{64}$/);
  });
  it('fails closed when verification cannot atomically consume a code', async () => {
    const service = new OtpService({ consumeOtp: jest.fn().mockResolvedValue(false) } as any);
    await expect(service.verifyOtp('t', '+919876543210', '123456')).rejects.toThrow();
  });
});
