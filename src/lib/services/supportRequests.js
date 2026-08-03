import { getSession } from 'next-auth/react';

import { publicApi } from '@/lib/axiosInstance';

const FALLBACK_MESSAGE = 'We could not send your request. Please try again.';

const normalizeMessage = (message) => (typeof message === 'string' && message.trim() ? message : FALLBACK_MESSAGE);

const normalizeFieldErrors = (errors) => {
  if (errors === null || typeof errors !== 'object' || Array.isArray(errors)) {
    return {};
  }

  const prototype = Object.getPrototypeOf(errors);
  if (prototype !== Object.prototype && prototype !== null) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors).flatMap(([field, messages]) => {
      if (!Array.isArray(messages)) {
        return [];
      }

      const validMessages = messages.filter((message) => typeof message === 'string' && message.trim());
      return validMessages.length > 0 ? [[field, validMessages]] : [];
    }),
  );
};

const normalizeFailure = (error) => ({
  success: false,
  status: error?.response?.status ?? 0,
  message: normalizeMessage(error?.response?.data?.message),
  errors: normalizeFieldErrors(error?.response?.data?.errors),
});

export async function submitSupportRequest(payload) {
  let session = null;

  try {
    session = await getSession();
  } catch {
    // Authentication is optional for this public support endpoint.
  }

  const headers = session?.access_token && !session?.error ? { Authorization: `Bearer ${session.access_token}` } : {};

  try {
    const response = await publicApi.post('/api/support-requests', payload, { headers });
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401 && error?.response?.data?.error === 'token_revoked') {
      try {
        const guestResponse = await publicApi.post('/api/support-requests', payload);
        return guestResponse.data;
      } catch (guestError) {
        return normalizeFailure(guestError);
      }
    }

    return normalizeFailure(error);
  }
}
