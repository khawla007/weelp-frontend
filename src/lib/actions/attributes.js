'use server';

import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * Method for Create attribute
 * @param {*} data
 * @returns {}
 */
export const createAttribute = async (data) => {
  try {
    await delay(500);
    const res = await authApi.post('/api/admin/attributes/', data);

    // revalidate  path
    revalidatePath('/dashboard/admin/taxonomies/attributes');

    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    log(err?.response?.data?.errors?.values);
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
        message: 'Attribute Already Exist',
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
 * Method for Update Attribute
 * @param {Number} AttributeId  Attribute id
 * @param {{}} data payload data
 * @returns {}
 */
export const editAttribute = async (id, data) => {
  try {
    await delay(500);
    const res = await authApi.put(`/api/admin/attributes/${id}`, data);

    // revalidate  path
    revalidatePath(`/dashboard/admin/taxonomies/attributes/${id}`); // Attribute id to update

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
        message: 'Attribute Already Exist',
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
 * Method for Delete Attribute
 * @param {Number} attributeId  attributeId id
 * @returns {}
 */
export const deleteAttribute = async (id) => {
  try {
    await delay(500);
    const res = await authApi.delete(`/api/admin/attributes/${id}`);

    // revalidate  path
    revalidatePath(`/dashboard/admin/taxonomies/attributes`); // update attributes
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
