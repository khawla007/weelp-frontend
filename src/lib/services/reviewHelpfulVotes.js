import { getAuthApi } from '@/lib/axiosInstance';

const HELPFUL_STATUS_ENDPOINT = '/api/reviews/helpful-status';
const ACCEPT_JSON_HEADERS = { Accept: 'application/json' };

const reviewHelpfulEndpoint = (reviewId) => `/api/reviews/${reviewId}/helpful`;

export async function getReviewHelpfulStatus(reviewIds) {
  const api = await getAuthApi();
  const response = await api.get(HELPFUL_STATUS_ENDPOINT, {
    params: { review_ids: reviewIds },
    headers: ACCEPT_JSON_HEADERS,
  });

  return response.data;
}

export async function addReviewHelpfulVote(reviewId) {
  const api = await getAuthApi();
  const response = await api.put(reviewHelpfulEndpoint(reviewId), undefined, {
    headers: ACCEPT_JSON_HEADERS,
  });

  return response.data;
}

export async function removeReviewHelpfulVote(reviewId) {
  const api = await getAuthApi();
  const response = await api.delete(reviewHelpfulEndpoint(reviewId), {
    headers: ACCEPT_JSON_HEADERS,
  });

  return response.data;
}
