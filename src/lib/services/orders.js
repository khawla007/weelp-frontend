import { createAuthenticatedServerApi, publicApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get Single Order Admin
 * @param {number} orderId Id of the order
 * @returns {}
 */
export async function getSingleOrderAdmin(orderId) {
  try {
    const api = await createAuthenticatedServerApi();
    const res = await api.get(`/api/admin/orders/${orderId}`, {
      headers: { Accept: 'application/json' },
    });

    // for handling diffrent response
    if (res.status === 200) return res.data;
    if (res.status === 404) return {}; // not found

    return {}; // fallback for other statuses
  } catch (error) {
    console.log('Error fetching order:', error?.message || error);
    return {}; // network error or unexpected exception
  }
}

/**
 * Get All Orders Admin
 * @param ##
 * @returns {}
 */
export async function getAllOrdersAdmin(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/orders/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return {};
  }
}

/**
 * Fetch order details for the Thank You page.
 * @param {string} payment_intent - Payment intent from query string
 * @returns {object} Order data or empty object if not found or failed
 */
export async function getUserOrderThankyou(payment_intent = '') {
  try {
    const res = await publicApi.get(`/api/order/thankyou`, {
      params: { payment_intent },
      headers: { Accept: 'application/json' },
    });

    if (res.status === 200) return res.data;
    if (res.status === 404) return {}; // Not found

    return {}; // Other unexpected status
  } catch (error) {
    log('Order Thankyou fetch error:', error?.response || error);
    return {};
  }
}
