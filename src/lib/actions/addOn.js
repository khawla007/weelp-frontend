'use server';

import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
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

    const res = await authApi.post('/api/admin/addons/', data);

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
        return ApiError({ status });
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

    const res = await authApi.put(`/api/admin/addons/${id}`, data);

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
        return ApiError({ status });
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

    const res = await authApi.delete(`/api/admin/addons/${id}`);

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
        return ApiError({ status });
    }
  }
};
