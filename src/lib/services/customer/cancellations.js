import { authApi } from '@/lib/axiosInstance';

const QUOTE_FALLBACK = 'We could not load the cancellation estimate. Please try again.';
const REQUEST_FALLBACK = 'We could not submit your cancellation request. Please try again.';

function cancellationError(error, fallback) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if ((status === 409 || status === 422) && typeof message === 'string' && message.trim()) {
    const cancellationRequestError = new Error(message.trim());
    cancellationRequestError.status = status;
    return cancellationRequestError;
  }

  return new Error(fallback);
}

export async function getCancellationQuote(orderId) {
  try {
    const response = await authApi.get(`/api/customer/userorders/${orderId}/cancellation-quote`);
    return response.data.quote;
  } catch (error) {
    throw cancellationError(error, QUOTE_FALLBACK);
  }
}

export async function createCancellationRequest(orderId, reason) {
  try {
    const response = await authApi.post(`/api/customer/userorders/${orderId}/cancellation-requests`, { reason });
    return response.data.cancellation;
  } catch (error) {
    throw cancellationError(error, REQUEST_FALLBACK);
  }
}
