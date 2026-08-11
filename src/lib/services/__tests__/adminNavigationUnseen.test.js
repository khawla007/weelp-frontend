import { authApi } from '@/lib/axiosInstance';

import { ADMIN_NAVIGATION_UNSEEN_KEY, fetchAdminNavigationUnseen, markAdminNavigationSeen, normalizeAdminNavigationCounts } from '../adminNavigationUnseen';

jest.mock('@/lib/axiosInstance', () => ({
  authApi: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe('admin navigation unseen service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets the admin navigation counts from the exact endpoint and normalizes them', async () => {
    authApi.get.mockResolvedValue({ data: { data: { orders: '4.9', reviews: -2 } } });

    await expect(fetchAdminNavigationUnseen()).resolves.toEqual({ orders: 4, reviews: 0 });
    expect(authApi.get).toHaveBeenCalledWith('/api/admin/navigation-unseen-counts');
  });

  it('marks a resource seen through a timestamp and normalizes the returned counts', async () => {
    const seenThrough = '2026-08-11T08:09:10.789Z';
    authApi.put.mockResolvedValue({ data: { data: { orders: 1, reviews: '3' } } });

    await expect(markAdminNavigationSeen('orders', seenThrough)).resolves.toEqual({ orders: 1, reviews: 3 });
    expect(authApi.put).toHaveBeenCalledWith(`${ADMIN_NAVIGATION_UNSEEN_KEY}/orders/seen`, { seen_through: seenThrough });
  });

  it('sends an empty object when no seen-through timestamp is supplied', async () => {
    authApi.put.mockResolvedValue({ data: { data: { orders: 0, reviews: 2 } } });

    await markAdminNavigationSeen('reviews');

    expect(authApi.put).toHaveBeenCalledWith('/api/admin/navigation-unseen-counts/reviews/seen', {});
  });

  it.each([
    [{ data: { orders: 2, reviews: 5 } }, { orders: 2, reviews: 5 }],
    [
      { orders: '8', reviews: 101.9 },
      { orders: 8, reviews: 101 },
    ],
    [
      { orders: -3, reviews: Number.NaN },
      { orders: 0, reviews: 0 },
    ],
    [{ orders: 'not-a-number' }, { orders: 0, reviews: 0 }],
    [undefined, { orders: 0, reviews: 0 }],
  ])('normalizes nested, direct, and missing count payloads', (payload, expected) => {
    expect(normalizeAdminNavigationCounts(payload)).toEqual(expected);
  });
});
