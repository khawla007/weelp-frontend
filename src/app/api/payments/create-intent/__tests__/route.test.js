import { POST } from '../route';
import { createAuthenticatedServerApi } from '@/lib/axiosInstance';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body, options = {}) => ({ status: options.status ?? 200, json: async () => body }),
  },
}));

jest.mock('@/lib/axiosInstance', () => ({
  createAuthenticatedServerApi: jest.fn(),
}));

describe('POST /api/payments/create-intent', () => {
  const post = jest.fn();

  beforeEach(() => {
    post.mockReset();
    createAuthenticatedServerApi.mockResolvedValue({ post });
  });

  it('forwards only booking-selection fields to the authenticated quote endpoint', async () => {
    post.mockResolvedValue({
      data: {
        success: true,
        clientSecret: 'redacted-client-secret',
        paymentIntent: 'redacted-intent',
        quote: { amount: 1416, currency: 'USD', base_amount: 1411, addons_amount: 5, addons: [] },
      },
    });

    const response = await POST({
      json: async () => ({
        order_type: 'activity',
        orderable_id: 7,
        travel_date: '2030-05-10',
        preferred_time: '09:00:00',
        number_of_adults: 3,
        number_of_children: 0,
        addon_ids: [4],
        amount: 1,
        email: 'must-not-forward@example.test',
      }),
    });

    expect(post).toHaveBeenCalledWith('/api/stripe/initialize-payment', {
      order_type: 'activity',
      orderable_id: 7,
      travel_date: '2030-05-10',
      preferred_time: '09:00:00',
      number_of_adults: 3,
      number_of_children: 0,
      variation_id: undefined,
      addon_ids: [4],
      bag_count: undefined,
      waiting_minutes: undefined,
      currency: undefined,
    });
    expect(response.status).toBe(200);
  });

  it('returns a safe session-expired response for an authenticated API 401', async () => {
    post.mockRejectedValue({ response: { status: 401, data: { token: 'must-not-leak' } } });

    const response = await POST({ json: async () => ({ order_type: 'activity', orderable_id: 7 }) });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ success: false, error: 'Your session has expired. Please sign in again.' });
  });
});
