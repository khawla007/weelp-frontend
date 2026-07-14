'use server';

import { createAuthenticatedServerApi } from '@/lib/axiosInstance';

/**
 * Handle for Create Order Action in checkout
 * @param {object} orderDetail - Required order details like amount, currency, etc.
 * @returns {Promise<{ success: boolean; data?: any; error?: string }>}
 */
export async function checkoutCreateOrder(orderDetail = {}) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.post(`/api/stripe/create-order`, orderDetail, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // handling success
    if (response.status == 200) {
      return { success: true, data: response?.data };
    }

    // If not 200,
    return {
      success: false,
      error: `Unexpected status code: ${response?.status}`,
    };
  } catch (error) {
    const status = error?.response?.status || 500;
    const backendMsg = error?.response?.data?.message || error?.response?.data?.error;
    if (status === 404) {
      return {
        success: false,
        error: 'The selected item is no longer available. Please refresh your cart.',
        code: 'ORDERABLE_NOT_FOUND',
      };
    }
    if (status === 401) {
      return {
        success: false,
        error: 'Your session has expired. Please sign in again.',
        code: 'SESSION_EXPIRED',
      };
    }
    return {
      success: false,
      error: backendMsg || `Server Error. Please Try Again (${status}).`,
    };
  }
}
