import { GET } from '../route';
import { getUserOrderThankyou } from '@/lib/services/orders';

jest.mock('next/server', () => ({
  NextResponse: { json: (body, options = {}) => ({ status: options.status ?? 200, json: async () => body }) },
}));
jest.mock('@/lib/services/orders', () => ({ getUserOrderThankyou: jest.fn() }));

describe('GET /api/public/checkout/thankyou', () => {
  it('rejects a malformed payment intent without calling Laravel', async () => {
    const response = await GET({ url: 'http://local.test/api/public/checkout/thankyou?payment_intent=bad' });
    expect(response.status).toBe(400);
    expect(getUserOrderThankyou).not.toHaveBeenCalled();
  });

  it('preserves a safe authenticated upstream status', async () => {
    getUserOrderThankyou.mockRejectedValue({ response: { status: 401, data: { secret: 'must-not-leak' } } });
    const response = await GET({ url: 'http://local.test/api/public/checkout/thankyou?payment_intent=pi_safe_fixture' });
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
  });
});
