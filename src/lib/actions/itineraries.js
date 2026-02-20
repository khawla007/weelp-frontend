'use server';
import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * Method for Create  Itinerary
 * @param {*} data
 * @returns {}
 */
export const createItinerary = async (data) => {
  log(data);
  try {
    await delay(500);
    const res = await authApi.post('/api/admin/itineraries', data);
    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    log(err?.response);
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
        message: 'Itinerary Already Exist',
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
 * Method for Edit  Itinerary
 * @param {number} id  - Id of the Itinerary
 * @param data - Data means to Payload data
 * @returns {}
 */
export const editItinerary = async (id, data) => {
  try {
    await delay(500);

    const res = await authApi.put(`/api/admin/itineraries/${id}`, data);

    // revalidate path
    if (res.status == 200) {
      revalidatePath('/dashboard/admin/itineraries/edit'); //revalidating path
      return {
        success: true,
        message: res.data?.message,
      };
    }
  } catch (err) {
    log(err);
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
 * Server action to delete itinerary context
 * @param {number} itineraryId  - itinerary ID
 * @param {Array} delete_type - deleted_schedule_id deleted_activity_ids  deleted_transfer_ids
 * @returns
 */
export async function deleteItineraryItems({
  itineraryId,
  deleted_schedule_ids = [],
  deleted_activity_ids = [],
  deleted_transfer_ids = [],
  deleted_price_variation_ids = [],
  deleted_blackout_date_ids = [],
  deleted_inclusion_exclusion_ids = [],
}) {
  try {
    const res = await authApi.delete(`/api/admin/itineraries/${itineraryId}/partial-delete/`, {
      data: {
        deleted_schedule_ids,
        deleted_activity_ids,
        deleted_transfer_ids,
        deleted_price_variation_ids,
        deleted_blackout_date_ids,
        deleted_inclusion_exclusion_ids,
      },
    });

    // revalidate data
    revalidatePath('/dashboard/admin/itineraries/edit'); // also add itinerary specific revalidate by id {/itineraryid}
    return { success: true, data: res.data };
  } catch (error) {
    log(error);
    return { success: false, error: error.message };
  }
}

/**
 * Action to delete itinerary
 * @param {number} itineraryId
 * @returns [{}]
 */
export async function deleteItinerary(itineraryId) {
  try {
    const res = await authApi.delete(`/api/admin/itineraries/${itineraryId}/`);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Action to delete multiple Itinerary
 * @param {[]} itinerary_ids
 * @returns [{}]
 */
export async function deleteMultipleItineraries(itinerary_ids = []) {
  try {
    const res = await authApi.post(`/api/admin/itineraries/bulk-delete`, {
      itinerary_ids,
    });

    // revalidate path
    revalidatePath('/dashboard/admin/itineraries'); //revalidating path
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
