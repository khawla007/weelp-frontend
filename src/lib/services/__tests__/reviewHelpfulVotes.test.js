import { getAuthApi } from '@/lib/axiosInstance';

import { addReviewHelpfulVote, getReviewHelpfulStatus, removeReviewHelpfulVote } from '../reviewHelpfulVotes';

jest.mock('@/lib/axiosInstance', () => ({
  getAuthApi: jest.fn(),
}));

describe('review Helpful vote service', () => {
  const api = {
    delete: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getAuthApi.mockResolvedValue(api);
  });

  it('gets Helpful status for the requested review IDs and returns response data', async () => {
    const responseData = { success: true, data: { review_ids: [8] } };
    api.get.mockResolvedValue({ data: responseData });

    await expect(getReviewHelpfulStatus([8, 3])).resolves.toBe(responseData);
    expect(getAuthApi).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/api/reviews/helpful-status', {
      params: { review_ids: [8, 3] },
      headers: { Accept: 'application/json' },
    });
  });

  it('adds a Helpful vote with an undefined body and returns response data', async () => {
    const responseData = {
      success: true,
      data: { review_id: 8, helpful_count: 1, viewer_has_marked_helpful: true },
    };
    api.put.mockResolvedValue({ data: responseData });

    await expect(addReviewHelpfulVote(8)).resolves.toBe(responseData);
    expect(getAuthApi).toHaveBeenCalledTimes(1);
    expect(api.put).toHaveBeenCalledWith('/api/reviews/8/helpful', undefined, {
      headers: { Accept: 'application/json' },
    });
  });

  it('removes a Helpful vote and returns response data', async () => {
    const responseData = {
      success: true,
      data: { review_id: 8, helpful_count: 0, viewer_has_marked_helpful: false },
    };
    api.delete.mockResolvedValue({ data: responseData });

    await expect(removeReviewHelpfulVote(8)).resolves.toBe(responseData);
    expect(getAuthApi).toHaveBeenCalledTimes(1);
    expect(api.delete).toHaveBeenCalledWith('/api/reviews/8/helpful', {
      headers: { Accept: 'application/json' },
    });
  });

  it.each([
    ['getReviewHelpfulStatus', () => getReviewHelpfulStatus([8]), 'get'],
    ['addReviewHelpfulVote', () => addReviewHelpfulVote(8), 'put'],
    ['removeReviewHelpfulVote', () => removeReviewHelpfulVote(8), 'delete'],
  ])('propagates %s errors unchanged', async (_name, request, method) => {
    const error = new Error('Unauthenticated');
    api[method].mockRejectedValue(error);

    await expect(request()).rejects.toBe(error);
  });
});
