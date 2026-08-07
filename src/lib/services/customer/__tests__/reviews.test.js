import { getSingleReviewByCustomer } from '../reviews';
import { authApi, getAuthApi } from '@/lib/axiosInstance';

jest.mock('@/lib/axiosInstance', () => ({
  authApi: { get: jest.fn() },
  getAuthApi: jest.fn(),
}));

describe('customer review services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the environment-aware authenticated API for a single review', async () => {
    const authenticatedApi = {
      get: jest.fn().mockResolvedValue({
        status: 200,
        data: { review: { id: 39, review_text: 'A thoughtful review' } },
      }),
    };
    getAuthApi.mockResolvedValue(authenticatedApi);
    authApi.get.mockRejectedValue(new Error('Missing server token'));

    const result = await getSingleReviewByCustomer('39');

    expect(getAuthApi).toHaveBeenCalledTimes(1);
    expect(authenticatedApi.get).toHaveBeenCalledWith('/api/customer/review/39', {
      headers: { Accept: 'application/json' },
    });
    expect(result.success).toBe(true);
  });
});
