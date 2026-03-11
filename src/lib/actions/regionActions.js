'use server';

import { getAuthApi } from '../axiosInstance';
import { revalidatePath } from 'next/cache';

/**
 * Create a new region
 * @param {Object} data - region data
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const createRegion = async (data = {}) => {
  try {
    const api = await getAuthApi();
    const res = await api.post('/api/admin/regions', data);
    revalidatePath('/dashboard/admin/destinations/regions');
    return { success: true, message: res.data?.message || 'Region created successfully' };
  } catch (err) {
    console.error('Error creating region:', err);
    const errorMessage = err.response?.data?.message || err.response?.data?.errors?.name?.[0] || 'Something went wrong';
    return { success: false, error: errorMessage };
  }
};

/**
 * Edit an existing region
 * @param {number} regionId - region id
 * @param {Object} data - region data
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const editRegion = async (regionId, data = {}) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/regions/${regionId}`, data);
    revalidatePath('/dashboard/admin/destinations/regions');
    return { success: true, message: res.data?.message || 'Region updated successfully' };
  } catch (err) {
    console.error('Error updating region:', err);
    const errorMessage = err.response?.data?.message || err.response?.data?.errors?.name?.[0] || 'Something went wrong';
    return { success: false, error: errorMessage };
  }
};

/**
 * Delete a region
 * @param {number} regionId - region id
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const deleteRegion = async (regionId) => {
  try {
    const api = await getAuthApi();
    const res = await api.delete(`/api/admin/regions/${regionId}`);
    revalidatePath('/dashboard/admin/destinations/regions');
    return { success: true, message: res.data?.message || 'Region deleted successfully' };
  } catch (err) {
    console.error('Error deleting region:', err);
    const errorMessage = err.response?.data?.message || 'Something went wrong';
    return { success: false, error: errorMessage };
  }
};
