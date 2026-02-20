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
