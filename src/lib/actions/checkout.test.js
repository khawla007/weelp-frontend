import { checkoutCreateOrder } from './checkout';
import { createAuthenticatedServerApi } from '@/lib/axiosInstance';

jest.mock('@/lib/axiosInstance', () => ({
  publicApi: { post: jest.fn() },
  createAuthenticatedServerApi: jest.fn(),
}));

jest.mock('@/lib/stripe/stripe-server', () => ({
  __esModule: true,
  default: {},
}));

describe('checkoutCreateOrder', () => {
  it('uses the authenticated server API for order creation', async () => {
    const post = jest.fn().mockResolvedValue({ status: 200, data: { success: true, order_id: 12 } });
    createAuthenticatedServerApi.mockResolvedValue({ post });
    const payload = { order_type: 'activity', orderable_id: 7, payment_intent_id: 'redacted-intent' };

    const result = await checkoutCreateOrder(payload);

    expect(post).toHaveBeenCalledWith('/api/stripe/create-order', payload, { headers: { 'Content-Type': 'application/json' } });
    expect(result).toEqual({ success: true, data: { success: true, order_id: 12 } });
  });

  it('returns a safe session-expired error for 401', async () => {
    const post = jest.fn().mockRejectedValue({ response: { status: 401, data: { token: 'must-not-leak' } } });
    createAuthenticatedServerApi.mockResolvedValue({ post });

    const result = await checkoutCreateOrder({});

    expect(result).toEqual({ success: false, error: 'Your session has expired. Please sign in again.', code: 'SESSION_EXPIRED' });
  });
});
