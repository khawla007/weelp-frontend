'use server';
import { revalidatePath } from 'next/cache';
import { getAuthApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * Method for Create Order
 * @param {object} data
 * @returns {}
 */
export const createOrder = async (data) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.post('/api/admin/orders', data);

    revalidatePath('/dashboard/admin/orders/'); // revalidate path of orders
    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    const status = err?.response?.status;

    // on status 400
    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        status: 400,
        // errors: err.response.data.errors,
      };
    }

    // on status 422
    if (status === 422) {
      return {
        success: false,
        message: 'Order Already Exist',
      };
    }

    if (status === 500) {
      return {
        success: false,
        message: err.response.data.error || 'Server error',
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

/**
 * Run an authenticated order mutation and normalize its result for the UI.
 * @param {(api: import('axios').AxiosInstance) => Promise<import('axios').AxiosResponse>} request
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function mutateOrder(request) {
  try {
    const api = await getAuthApi();
    const res = await request(api);

    if (!res.data?.success) {
      return {
        success: false,
        message: res.data?.message || 'Order action failed.',
      };
    }

    revalidatePath('/dashboard/admin/orders');
    return { success: true, message: res.data.message };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error?.message || 'Order action failed.',
    };
  }
}

/** Move an active order to Trash. */
export async function deleteOrder(orderId) {
  return mutateOrder((api) => api.delete(`/api/admin/orders/${orderId}`));
}

/** Restore an order from Trash. */
export async function restoreOrder(orderId) {
  return mutateOrder((api) => api.post(`/api/admin/orders/${orderId}/restore`));
}

/** Permanently delete an order that is already in Trash. */
export async function permanentlyDeleteOrder(orderId) {
  return mutateOrder((api) => api.delete(`/api/admin/orders/${orderId}/force`));
}

/**
 * Action to update Order Status
 * @param {number} orderId
 * @param {string} status
 * @returns [{}]
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/orders/${orderId}`, { status });

    // On successful
    if (res.data?.success) {
      revalidatePath('/dashboard/admin/orders'); // Revalidating Orders
      return { success: true, message: res.data.message };
    }

    // Return server response in case of known error
    return {
      success: false,
      message: res.data?.message || 'Failed to update order status.',
    };
  } catch (error) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message;

    if (status === 400) {
      return {
        success: false,
        message: message || 'Invalid status update request.',
      };
    }

    return { success: false, error: message };
  }
}
