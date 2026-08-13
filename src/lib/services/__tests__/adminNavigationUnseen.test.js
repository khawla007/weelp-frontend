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
    authApi.get.mockResolvedValue({ data: { data: { orders: '4.9', reviews: -2, has_actionable_cancellations: true } } });

    await expect(fetchAdminNavigationUnseen()).resolves.toEqual({ counts: { orders: 4, reviews: 0 }, attention: { cancellations: true } });
    expect(authApi.get).toHaveBeenCalledWith('/api/admin/navigation-unseen-counts');
  });

  it('marks a resource seen through a timestamp and normalizes the returned counts', async () => {
    const seenThrough = '2026-08-11T08:09:10.789Z';
    authApi.put.mockResolvedValue({ data: { data: { orders: 1, reviews: '3', has_actionable_cancellations: true } } });

    await expect(markAdminNavigationSeen('orders', seenThrough)).resolves.toEqual({ counts: { orders: 1, reviews: 3 }, attention: { cancellations: true } });
    expect(authApi.put).toHaveBeenCalledWith(`${ADMIN_NAVIGATION_UNSEEN_KEY}/orders/seen`, { seen_through: seenThrough });
  });

  it('sends an empty object when no seen-through timestamp is supplied', async () => {
    authApi.put.mockResolvedValue({ data: { data: { orders: 0, reviews: 2 } } });

    await markAdminNavigationSeen('reviews');

    expect(authApi.put).toHaveBeenCalledWith('/api/admin/navigation-unseen-counts/reviews/seen', {});
  });

  it.each([
    [{ data: { orders: 2, reviews: 5, has_actionable_cancellations: true } }, { counts: { orders: 2, reviews: 5 }, attention: { cancellations: true } }],
    [
      { orders: '8', reviews: 101.9 },
      { counts: { orders: 8, reviews: 101 }, attention: { cancellations: false } },
    ],
    [
      { orders: -3, reviews: Number.NaN },
      { counts: { orders: 0, reviews: 0 }, attention: { cancellations: false } },
    ],
    [
      { orders: 'not-a-number', has_actionable_cancellations: 1 },
      { counts: { orders: 0, reviews: 0 }, attention: { cancellations: false } },
    ],
    [undefined, { counts: { orders: 0, reviews: 0 }, attention: { cancellations: false } }],
  ])('normalizes nested, direct, and missing count payloads', (payload, expected) => {
    expect(normalizeAdminNavigationCounts(payload)).toEqual(expected);
  });
});
