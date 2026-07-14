import { POST } from '../route';
import { createAuthenticatedServerApi } from '@/lib/axiosInstance';

jest.mock('next/server', () => ({
  NextResponse: { json: (body, options = {}) => ({ status: options.status ?? 200, json: async () => body }) },
}));
jest.mock('@/lib/axiosInstance', () => ({ createAuthenticatedServerApi: jest.fn() }));

describe('POST /api/public/checkout/confirmation', () => {
  it('uses the authenticated server API and forwards only the session identifier', async () => {
    const post = jest.fn().mockResolvedValue({ status: 200, data: { success: true } });
    createAuthenticatedServerApi.mockResolvedValue({ post });

    const response = await POST({ json: async () => ({ session_id: 'cs_test_safe_fixture', token: 'must-not-forward' }) });

    expect(post).toHaveBeenCalledWith('/api/confirm-payment', { session_id: 'cs_test_safe_fixture' });
    expect(response.status).toBe(200);
  });

  it('returns a safe not-found response without exposing upstream data', async () => {
    const post = jest.fn().mockRejectedValue({ response: { status: 404, data: { session_id: 'must-not-leak' } } });
    createAuthenticatedServerApi.mockResolvedValue({ post });

    const response = await POST({ json: async () => ({ session_id: 'cs_test_safe_fixture' }) });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Payment confirmation not found' });
  });
});
