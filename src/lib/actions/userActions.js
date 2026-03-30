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
    const res = await api.put(`/api/admin/users/update${userId}`, data, {
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
        errors: err?.response?.data?.errors,
      };
    }

    return {
      success: false,
      message: 'Something went wrong while editing user',
    };
  }
};

/**
 * Method for Bulk Delete Users
 * @param {Number[]} userIds - Array of user IDs to delete
 * @returns {{ success: boolean, message?: string, error?: string }}
 */
export const deleteMultipleUsers = async (userIds = []) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.post('/api/admin/users/bulk-delete', {
      user_ids: userIds,
    });

    // revalidate path
    revalidatePath('/dashboard/admin/users');

    return {
      success: true,
      message: res?.data?.message || `${userIds.length} users deleted successfully`,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || error?.message || 'Something went wrong',
    };
  }
};

/**
 * Method to Delete a Single User
 * @param {Number} userId - ID of the user to delete
 * @returns {{ success: boolean, message?: string, error?: string }}
 */
export const deleteUser = async (userId) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.delete(`/api/admin/users/${userId}`);

    // revalidate path
    revalidatePath('/dashboard/admin/users');

    return {
      success: true,
      message: res?.data?.message || 'User deleted successfully',
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || error?.message || 'Something went wrong',
    };
  }
};

/**
 * Action to Change User Password
 * @param {object} passwordData - { current_password, password, password_confirmation }
 * @returns {{ success: boolean, message?: string, error?: string }}
 */
export const changePasswordAction = async (passwordData) => {
  try {
    const api = await getAuthApi();
    const res = await api.put('/api/customer/password', passwordData);

    return {
      success: true,
      message: res?.data?.message || 'Password changed successfully',
    };
  } catch (error) {
    console.error('Error in changePasswordAction:', error);
    return {
      success: false,
      error: error?.response?.data?.error || error?.response?.data?.message || 'Failed to change password',
    };
  }
};
