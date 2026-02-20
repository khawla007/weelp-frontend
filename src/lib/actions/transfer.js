'use server';

import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * Action for Create Transfer By Admin
 * @param {{ name: string, slug: string, description: string, transferType: string, vendor_id: number, route_id: number, pricing_tier_id: number, availability_id: number, media_gallery: { media_id: number, name: string, alt_text: string, url: string, created_at: string, updated_at: string }[] }} data - Transfer creation payload
 * @returns {{ success: boolean, message: string }} - API response status and message
 */
export const createTransferByAdmin = async (data = {}) => {
  try {
    await delay(500);
    const res = await authApi.post('/api/admin/transfers', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath('/dashboard/admin/transfers'); // revalidate api

    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    log(err?.response);
    const status = err?.response?.status;

    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

/**
 * Action for Edit Transfer By Admin
 * @param {string} transferId - transferId
 * @param {object} data - Transfer udpate payload
 * @returns {{ success: boolean, message: string }} - API response status and message
 */
export const editTransferByAdmin = async (transferId, data = {}) => {
  try {
    await delay(500);
    const res = await authApi.put(`/api/admin/transfers/${transferId}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath('/dashboard/admin/transfers'); // revalidate api

    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    log(err?.response);
    const status = err?.response?.status;

    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

/**
 * Action to delete Transfer
 * @param {number} transferId
 * @returns {{ success: boolean, message: string }} - API response status and message
 */
export async function deleteTransfer(transferId) {
  try {
    const res = await authApi.delete(`/api/admin/transfers/${transferId}/`);

    revalidatePath('/dashboard/admin/transfers'); //revalidating path
    return { success: true, message: res.data?.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 *Action  Deletes multiple transfers by their IDs.
 * @param {Object} params - Parameters object.
 * @param {number[]} params.transferIds - Array of transfer IDs to delete.
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 * - The result of the API call:
 *   - `success`: Whether the operation succeeded.
 *   - `message`: Success message from the server (if any).
 *   - `error`: Error message if the operation failed.
 */
export async function deleteMultipleTransfers({ transferIds: ids = [] }) {
  try {
    const res = await authApi.post(`/api/admin/transfers/bulk-delete/`, {
      ids,
    });

    revalidatePath('/dashboard/admin/transfers');
    return { success: true, message: res.data?.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
