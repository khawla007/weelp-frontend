// This File Will Hanldle Customer Based Logics

import { createAuthenticatedServerApi } from '../axiosInstance';

export const getUserProfile = async () => {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get('/api/customer/profile');

    if (response.status === 200) {
      return { user: response?.data?.user, error: null };
    } else {
      return { user: null, error: 'Unexpected response from server.' };
    }
  } catch (error) {
    console.log('Error fetching user:', error);
    return { user: null, error: 'Failed to load profile. Please try again.' };
  }
};

/**
 * Get Single User on Admin side
 * @param {String} userId id of the User
 * @returns {object}
 */
export async function getSingleUserAdmin(userId) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/users/${userId}`, {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  } catch (error) {
    return {};
  }
}

/**
 * Get All Users
 * @returns []
 */
export async function getAllUsersAdmin() {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get('/api/admin/users');
    return response?.data;
  } catch (error) {
    console.log('Error fetching users:', error);
    return [];
  }
}

/**
 * Delete a single user
 * @param {String|Number} userId - ID of the user to delete
 * @returns {object} Response data
 */
export async function deleteUser(userId) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.delete(`/api/admin/users/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.log('Error deleting user:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete user',
    };
  }
}

/**
 * Bulk delete users
 * @param {Array} userIds - Array of user IDs to delete
 * @returns {object} Response data
 */
export async function bulkDeleteUsers(userIds) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.post('/api/admin/users/bulk-delete', {
      user_ids: userIds,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.log('Error bulk deleting users:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete users',
    };
  }
}
