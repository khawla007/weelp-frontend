'use server';

import { delay, log } from '@/lib/utils';
import { getAuthApi } from '../axiosInstance';
import { revalidatePath } from 'next/cache';

//  For Creating Users
export const createUserAction = async (formData) => {
  try {
    await delay(2000);
    const api = await getAuthApi();
    const response = await api.post('/api/admin/users/create', formData);
    return { success: true, data: response.data };
  } catch (error) {
    if (error?.response?.status === 422) {
      const errors = error.response.data.errors;
      const msg = Object.values(errors)?.[0]?.[0] ?? 'Something went wrong.';

      return { success: false, message: msg, errors };
    }

    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    };
  }
};

// Edit UserProfile {** PUT}
export const editUserProfileAction = async (formData) => {
  try {
    const api = await getAuthApi();
    const response = await api.put('/api/customer/profile', formData, {
      headers: { 'Content-Type': 'application/json' },
    });

    await delay(2000);
    revalidatePath('/dashboard/customer/settings/profile');

    return { success: true, data: response?.data };
  } catch (error) {
    console.error('Error in editUserProfileAction:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Something went wrong.',
    };
  }
};

/**
 * Action to Edit User Super Admin
 * @param {number} userId
 * @returns {{ success: boolean, message: string }} - API response status and message
 */
export const editUserAdmin = async (userId, data = {}) => {
  try {
    await delay(500);

    const api = await getAuthApi();
    const res = await api.put(`/api/admin/users/${userId}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath('/dashboard/admin/users'); // revalidate API cache

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
        errors: err?.response?.data?.errors,
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'User Validation error',
      };
    }

    return {
      success: false,
      message: 'Something went wrong while editing Place',
    };
  }
};
