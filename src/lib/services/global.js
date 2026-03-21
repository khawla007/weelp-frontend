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
export const getCategoriesAdmin = async (page, { all = false } = {}) => {
  try {
    const api = await createAuthenticatedServerApi();
    const query = all ? '?all=true' : page ? `?page=${page}` : '';
    const response = await api.get(`/api/admin/categories${query}`);
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
    const response = await api.get('/api/admin/cities/list');
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
export const getAllAttributesAdmin = async (page, { all = false } = {}) => {
  try {
    const api = await createAuthenticatedServerApi();
    const query = all ? '?all=true' : page ? `?page=${page}` : '';
    const response = await api.get(`/api/admin/attributes${query}`);
    return { data: response?.data ?? [] };
  } catch (error) {
    return { data: [] };
  }
};

/**
 * Get All Tags (Public)
 * @returns []
 */
export const getTags = async () => {
  try {
    const response = await publicApi.get('/api/tags');
    return response?.data?.data ?? response?.data ?? [];
  } catch (error) {
    console.log('Error fetching tags:', error);
    return [];
  }
};

/**
 * Home Search - merges activities, itineraries, packages
 * @param {Object} params - Search parameters
 * @returns {Object} { data: [], pagination: {} }
 */
export const homeSearch = async (params) => {
  try {
    const response = await publicApi.get('/api/homesearch', { params });
    return response?.data;
  } catch (error) {
    console.log('Error in home search:', error);
    return { success: 'false', data: [] };
  }
};

/**
 * Get All TagsAdmin
 * @param {string} page
 * @returns []
 */
export const getAllTagsAdmin = async (page = '', { all = false } = {}) => {
  try {
    const api = await createAuthenticatedServerApi();
    const query = all ? '?all=true' : page ? `?page=${page}` : '';
    const response = await api.get(`/api/admin/tags${query}`);
    return { data: response?.data ?? [] };
  } catch (error) {
    return { data: [] }; // ✅ FIXED: consistent return shape
  }
};
