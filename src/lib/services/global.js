'use server';
import { authApi, publicApi, createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get All Cities and Region
 * @returns []
 */
export const getCitiesRegions = async () => {
  try {
    const response = await publicApi.get(`/api/regions-cities`);

    return response?.data; //
  } catch (error) {
    console.log('Error fetching cities:', error);
    return []; // return empty array
  }
};

/**
 * Get All Categories
 * @returns []
 */
export const getCategories = async () => {
  try {
    const response = await publicApi.get('/api/categories');
    return response.data.data ?? [];
  } catch (error) {
    console.error('Failed to fetch categories', error);
    return [];
  }
};

/**
 * Get All categories Admin Side
 * @param {String} page pageno
 * @returns {}
 */
export const getCategoriesAdmin = async (page) => {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/categories${page ? `?page=${page}` : ''}`);
    return { data: response?.data ?? [] };
  } catch (error) {
    return { data: [] };
  }
};

/**
 * Get All Cities ( legacy )
 * @deprecated Please use for  {@link getAllCitiesAdminV2} instead (optimized version).
 * For More Information @see @lib/services/cities.js
 * @returns []
 */

export const getAllCitiesAdmin = async () => {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get('/api/admin/cities');
    return { data: response?.data ?? [] };
  } catch (error) {
    return { data: [] };
  }
};

/**
 * Get All Attributes
 * @param {string} page
 * @returns []
 */
export const getAllAttributesAdmin = async (page) => {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/attributes${page ? `?page=${page}` : ''}`);
    return { data: response?.data ?? [] };
  } catch (error) {
    return { data: [] };
  }
};

/**
 * Get All TagsAdmin
 * @param {string} page
 * @returns []
 */
export const getAllTagsAdmin = async (page = '') => {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/tags${page ? `?page=${page}` : ''}`);
    return { data: response?.data ?? [] };
  } catch (error) {
    return { data: [] }; // ✅ FIXED: consistent return shape
  }
};
