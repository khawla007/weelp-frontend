'use server';

import { revalidatePath } from 'next/cache';
import { getAuthApi } from '../axiosInstance';
import { delay, log } from '../utils';
import { ApiError } from '@/dto/Error';

/**
 * Method to create an Add-On
 * @param {AddOnForm} data - Payload data
 * @returns {Promise<{success: boolean, message: string, status?: number, errors?: any}>}
 */
export const createAddOn = async (data) => {
  try {
    await delay(500);

    // Ensure active_status is explicitly a boolean (handle undefined/null cases)
    const requestData = {
      ...data,
      active_status: data.active_status === true,
    };

    const api = await getAuthApi();
    const res = await api.post('/api/admin/addons', requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath('/dashboard/admin/addon'); // create add ons

    return {
      success: true,
      message: res.data?.message || 'Add On created successfully',
    };
  } catch (err) {
    const status = err?.response?.status;

    switch (status) {
      case 422:
        return ApiError({
          message: err.response.data?.message || 'Server side Validation Failed',
          status,
        });
      case 500:
        return ApiError({
          message: err.response.data?.error || 'Internal server error',
          status,
        });
      default:
        return ApiError({
          message: err?.response?.data?.message || err?.message || 'Something went wrong',
          status,
        });
    }
  }
};

/**
 * Method to Edit an Add-On
 * @param {number|string} id - Id of Add on
 * @param {AddOnForm} data - Payload data
 * @returns {Promise<{success: boolean, message: string, status?: number, errors?: any}>}
 */
export const editAddOn = async (id, data) => {
  try {
    await delay(500);

    // Ensure active_status is explicitly a boolean (handle undefined/null cases)
    const requestData = {
      ...data,
      active_status: data.active_status === true,
    };

    const api = await getAuthApi();
    const res = await api.put(`/api/admin/addons/${id}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath('/dashboard/admin/addon'); // create add ons

    return {
      success: true,
      message: res.data?.message || 'Add On Edited successfully',
    };
  } catch (err) {
    const status = err?.response?.status;

    switch (status) {
      case 422:
        return ApiError({
          message: err.response.data?.message || 'Server side Validation Failed',
          status,
        });
      case 500:
        return ApiError({
          message: err.response.data?.error || 'Internal server error',
          status,
        });
      default:
        return ApiError({
          message: err?.response?.data?.message || err?.message || 'Something went wrong',
          status,
        });
    }
  }
};

/**
 * Method to Edit an Add-On
 * @param {number|string} id - Id of Add on
 * @returns {Promise<{success: boolean, message: string, status?: number, errors?: any}>}
 */
export const deleteAddon = async (id) => {
  try {
    await delay(500);

    const api = await getAuthApi();
    const res = await api.delete(`/api/admin/addons/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath('/dashboard/admin/addon'); // create add ons

    return {
      success: true,
      message: res.data?.message || 'Deleted successfully',
    };
  } catch (err) {
    const status = err?.response?.status;

    switch (status) {
      case 422:
        return ApiError({
          message: err.response.data?.message || 'Server side Validation Failed',
          status,
        });
      case 500:
        return ApiError({
          message: err.response.data?.error || 'Internal server error',
          status,
        });
      default:
        return ApiError({
          message: err?.response?.data?.message || err?.message || 'Something went wrong',
          status,
        });
    }
  }
};

/**
 * Deletes multiple add-ons by IDs.
 *
 * @param {number[]} addonIds - Array of add-on IDs to delete.
 * @returns {Promise<{success: boolean, message: string, status?: number, errors?: any}>}
 */
export const deleteMultipleAddons = async (addonIds = []) => {
  try {
    await delay(500);

    const api = await getAuthApi();
    const res = await api.post(
      '/api/admin/addons/bulk-delete',
      {
        addon_ids: addonIds,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    revalidatePath('/dashboard/admin/addon');

    return {
      success: true,
      message: res.data?.message || `${addonIds.length} add-on(s) deleted successfully`,
    };
  } catch (err) {
    const status = err?.response?.status;

    switch (status) {
      case 422:
        return ApiError({
          message: err.response.data?.message || 'Server side Validation Failed',
          status,
        });
      case 500:
        return ApiError({
          message: err.response.data?.error || 'Internal server error',
          status,
        });
      default:
        return ApiError({
          message: err?.response?.data?.message || err?.message || 'Something went wrong',
          status,
        });
    }
  }
};
