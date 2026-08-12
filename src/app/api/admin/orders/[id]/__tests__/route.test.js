import { GET } from '../route';
import { createAuthenticatedServerApi } from '@/lib/axiosInstance';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, options = {}) => ({
      status: options.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock('@/lib/axiosInstance', () => ({
  createAuthenticatedServerApi: jest.fn(),
}));

describe('GET /api/admin/orders/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('awaits the route params and forwards the authenticated upstream response', async () => {
    const orderResponse = { success: true, data: { id: 42 } };
    const get = jest.fn().mockResolvedValue({ data: orderResponse, status: 200 });
    createAuthenticatedServerApi.mockResolvedValue({ get });

    const response = await GET(undefined, { params: Promise.resolve({ id: '42' }) });

    expect(createAuthenticatedServerApi).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/api/admin/orders/42');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(orderResponse);
  });

  it.each([
    [401, 401, 'Authentication required.'],
    [403, 403, 'Forbidden.'],
    ['404', 404, 'Order not found.'],
  ])('returns a safe $expectedStatus response without leaking the upstream body', async (upstreamStatus, expectedStatus, message) => {
    const get = jest.fn().mockRejectedValue({
      response: {
        status: upstreamStatus,
        data: { message: 'upstream secret', token: 'must-not-leak' },
      },
    });
    createAuthenticatedServerApi.mockResolvedValue({ get });

    const response = await GET(undefined, { params: Promise.resolve({ id: '42' }) });

    expect(response.status).toBe(expectedStatus);
    await expect(response.json()).resolves.toEqual({ success: false, message });
  });

  it.each(['0', '-1', '1.5', 'abc', '999999999999999999999'])('rejects invalid order ID %s before creating an authenticated API', async (id) => {
    const response = await GET(undefined, { params: Promise.resolve({ id }) });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ success: false, message: 'Invalid order ID.' });
    expect(createAuthenticatedServerApi).not.toHaveBeenCalled();
  });

  it('returns a generic 500 response for unknown failures', async () => {
    createAuthenticatedServerApi.mockRejectedValue(new Error('private server details'));

    const response = await GET(undefined, { params: Promise.resolve({ id: '42' }) });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ success: false, message: 'We could not load this order.' });
  });
});
