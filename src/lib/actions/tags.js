'use server';

import { revalidatePath } from 'next/cache';
import { getAuthApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * Method for Create Tags
 * @param {{}} data payload data
 * @returns {}
 */
export const createTag = async (data) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.post('/api/admin/tags/', data);

    // revalidate  path
    revalidatePath('/dashboard/admin/taxonomies/tags');

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
        status: 400,
        errors: err.response.data.errors,
      };
    }

    if (status === 422) {
      const message = err.response.data.message;
      return {
        success: false,
        message: 'Tags Already Exist',
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
      message: err?.message || 'Something went wrong',
    };
  }
};

/**
 * Method for Update tag
 * @param {Number} tagId  tag id
 * @param {{}} data payload data
 * @returns {}
 */
export const editTag = async (id, data) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/tags/${id}`, data);

    // revalidate  path
    revalidatePath(`/dashboard/admin/taxonomies/tags/${id}`); // Tag id to update

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
        status: 400,
        errors: err.response.data.errors,
      };
    }

    if (status === 422) {
      const message = err.response.data.message;
      return {
        success: false,
        message: 'Tags Already Exist',
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
 * Method for Delete Tag
 * @param {Number} TagId  Tag id
 * @returns {}
 */
export const deleteTag = async (id) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.delete(`/api/admin/tags/${id}`);

    // revalidate  path
    revalidatePath(`/dashboard/admin/taxonomies/tags`); // update tags
    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    const status = err?.response?.status;

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
 * Method for Bulk Delete Tags
 * @param {Number[]} tagIds - Array of tag IDs to delete
 * @returns {}
 */
export const deleteMultipleTags = async (tagIds = []) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.post('/api/admin/tags/bulk-delete', {
      tag_ids: tagIds,
    });

    // revalidate  path
    revalidatePath('/dashboard/admin/taxonomies/tags');

    return {
      success: true,
      message: res?.data?.message || `${tagIds.length} tags deleted successfully`,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || error?.message || 'Something went wrong',
    };
  }
};
