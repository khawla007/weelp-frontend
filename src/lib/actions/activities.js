'use server';

import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * Method for Create  Activity
 * @param {*} data
 * @returns {}
 */
export const createActivity = async (data) => {
  try {
    await delay(500);
    log(data);
    const res = await authApi.post('/api/admin/activities', data);

    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    const status = err?.response?.status;
    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        status: 400,
        errors: err.response.data.errors,
      };
    }

    if (status === 422) {
      const message = err.response.data.message;
      return {
        success: false,
        message: 'Activity Already Exist',
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
 * Method for Edit  Activity
 * @param {number} id  - Id of the Activity
 * @param data - Data means to Payload data
 * @returns {}
 */
export const editActivity = async (id, data) => {
  try {
    await delay(500);

    const res = await authApi.put(`/api/admin/activities/${id}`, data);

    // revalidate path
    if (res.status == 200) {
      revalidatePath('/dashboard/admin/activities/edit'); //revalidating path
      return {
        success: true,
        message: res.data?.message,
      };
    }
  } catch (err) {
    const status = err?.response?.status;
    if (status === 400) {
      return {
        success: false,
        message: err.response.data.message || 'validation error',
        status: 400,
        errors: err.response.data.message,
      };
    }

    if (status === 422) {
      const message = err.response.data.message;
      return {
        success: false,
        message: 'Activity Already Exist',
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
 * Action to delete Activity
 * @param {number} activityId
 * @returns [{}]
 */
export async function deleteActivity(activityId) {
  try {
    const res = await authApi.delete(`/api/admin/activities/${activityId}/`);

    // revalidate path
    revalidatePath('/dashboard/admin/activities'); //revalidating path
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Server action to delete activity context
 * @param {number} activityId  - activity ID
 * @param {Array} delete_type - deleted_location_ids deleted_seasonal_pricing_ids  deleted_group_discounts_ids deleted_promo_codes_ids
 * @returns
 */
export async function deleteActivityItems({ activityId, deleted_location_ids = [], deleted_seasonal_pricing_ids = [], deleted_group_discounts_ids = [], deleted_promo_codes_ids = [] }) {
  try {
    // delete data
    const res = await authApi.delete(`/api/admin/activities/${activityId}/partial-delete`, {
      data: {
        deleted_location_ids,
        deleted_seasonal_pricing_ids,
        deleted_group_discounts_ids,
        deleted_promo_codes_ids,
      },
    });

    // revalidate data
    revalidatePath(`/dashboard/admin/activities/${activityId}`); // revalidate paths
    return { success: true, data: 'Deleted Successfully' };
  } catch (error) {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.message || 'Something went wrong';
    return {
      success: false,
      error: serverMessage,
    };
  }
}

/**
 * Action to delete multiple Activity
 * @param {[]} activity_ids
 * @returns [{}]
 */
export async function deleteMultipleActivities(activity_ids = []) {
  try {
    const res = await authApi.post(`/api/admin/activities/bulk-delete`, {
      activity_ids,
    });

    // revalidate path
    revalidatePath('/dashboard/admin/activities'); //revalidating path
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
