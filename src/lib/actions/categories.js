'use server';

import { revalidatePath } from 'next/cache';
import { getAuthApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * Method for Create Category
 * @param {*} data
 * @returns {}
 */
export const createCategory = async (data) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.post('/api/admin/categories/', data);

    // revalidate  path
    revalidatePath('/dashboard/admin/taxonomies/categories');

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
        message: 'Category Already Exist',
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
 * Method for Update Category
 * @param {Number} categoryId  category id
 * @param {{}} data payload data
 * @returns {}
 */
export const editCategory = async (id, data) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/categories/${id}`, data);

    // revalidate  path
    revalidatePath(`/dashboard/admin/taxonomies/categories/${id}`); // category id to update

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
        message: 'Category Already Exist',
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
 * Method for Delete Category
 * @param {Number} categoryId  category id
 * @returns {}
 */
export const deleteCategory = async (id) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.delete(`/api/admin/categories/${id}`);

    // revalidate  path
    revalidatePath(`/dashboard/admin/taxonomies/categories`); // update categories
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
 * Method for Bulk Delete Categories
 * @param {Number[]} categoryIds - Array of category IDs to delete
 * @returns {}
 */
export const deleteMultipleCategories = async (categoryIds = []) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.post('/api/admin/categories/bulk-delete', {
      category_ids: categoryIds,
    });

    // revalidate  path
    revalidatePath('/dashboard/admin/taxonomies/categories');

    return {
      success: true,
      message: res?.data?.message || `${categoryIds.length} categories deleted successfully`,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || error?.message || 'Something went wrong',
    };
  }
};
