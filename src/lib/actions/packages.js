'use server';
import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * Method for Create  Package
 * @param {*} data
 * @returns {}
 */
export const createPackage = async (data) => {
  try {
    await delay(500);
    const res = await authApi.post('/api/admin/packages', data);
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
 * Method for Edit  Package
 * @param {number} id  - Id of the Package
 * @param data -  Payload data
 * @returns {}
 */
export const editPackage = async (id, data) => {
  try {
    await delay(500);

    const res = await authApi.put(`/api/admin/packages/${id}`, data);

    // revalidate path
    if (res.status == 200) {
      revalidatePath('/dashboard/admin/package-builder/edit'); //revalidating path
      return {
        success: true,
        message: res.data?.message,
      };
    }
  } catch (err) {
    log(err?.response);
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
export async function deletePackageItems({
  packageId,
  deleted_schedule_ids = [],
  deleted_activity_ids = [],
  deleted_transfer_ids = [],
  deleted_itinerary_ids = [],
  deleted_faq_ids = [],
  deleted_price_variation_ids = [],
  deleted_blackout_date_ids = [],
  deleted_inclusion_exclusion_ids = [],
  deleted_information_ids = [],
}) {
  try {
    // delete data
    const res = await authApi.delete(`/api/admin/packages/${packageId}/partial-delete/`, {
      data: {
        deleted_schedule_ids,
        deleted_activity_ids,
        deleted_transfer_ids,
        deleted_itinerary_ids,
        deleted_faq_ids,
        deleted_price_variation_ids,
        deleted_blackout_date_ids,
        deleted_inclusion_exclusion_ids,
        deleted_information_ids,
      },
    });

    // revalidate data
    revalidatePath('/dashboard/admin/packages/edit'); // pending work itinerary specific revalidate by id {/dashboard/admin/packages/edit/itineraryid}
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
 * Action to delete package
 * @param {number} packageId
 * @returns [{}]
 */
export async function deletePackage(packageId) {
  try {
    const res = await authApi.delete(`/api/admin/packages/${packageId}/`);
    revalidatePath('/dashboard/admin/package-builder'); //revalidating path
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Action to delete multiple Package
 * @param {[]} package_ids
 * @returns [{}]
 */
export async function deleteMultiplePackages(package_ids = []) {
  try {
    const res = await authApi.post(`/api/admin/packages/bulk-delete`, {
      package_ids,
    });

    // revalidate path
    revalidatePath('/dashboard/admin/package-builder'); //revalidating path
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
