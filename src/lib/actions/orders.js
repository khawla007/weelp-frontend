'use server';
import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * Method for Create Order
 * @param {object} data
 * @returns {}
 */
export const createOrder = async (data) => {
  try {
    await delay(500);
    const res = await authApi.post('/api/admin/orders', data);

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
 * Action to delete Order
 * @param {number} orderId
 * @returns [{}]
 */
export async function deleteOrder(orderId) {
  try {
    const res = await authApi.delete(`/api/admin/orders/${orderId}`);

    // On successful
    if (res.data?.success) {
      revalidatePath('/dashboard/admin/orders'); // Revalidating Orders
      return { success: true, message: res.data.message };
    }

    // Return server response in case of known error
    return {
      success: false,
      message: res.data?.message || 'Failed to delete order.',
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
