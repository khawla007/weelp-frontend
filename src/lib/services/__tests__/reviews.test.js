import { publicApi } from '@/lib/axiosInstance';

import { getTransferFeaturedReviews } from '../reviews';

jest.mock('@/lib/axiosInstance', () => ({
  createAuthenticatedServerApi: jest.fn(),
  publicApi: {
    get: jest.fn(),
  },
}));

describe('getTransferFeaturedReviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the transfer review list from the filtered endpoint', async () => {
    const reviews = [{ id: 7, review_text: 'Smooth pickup.' }];
    publicApi.get.mockResolvedValue({
      data: { success: true, data: reviews },
    });

    await expect(getTransferFeaturedReviews()).resolves.toEqual(reviews);
    expect(publicApi.get).toHaveBeenCalledWith('/api/reviews/featured-reviews?item_type=transfer', {
      headers: { Accept: 'application/json' },
    });
  });

  it('returns an empty list for unsuccessful and failed responses', async () => {
    publicApi.get.mockResolvedValueOnce({
      data: { success: false, data: [] },
    });
    await expect(getTransferFeaturedReviews()).resolves.toEqual([]);

    publicApi.get.mockRejectedValueOnce(new Error('offline'));
    await expect(getTransferFeaturedReviews()).resolves.toEqual([]);
  });
});
