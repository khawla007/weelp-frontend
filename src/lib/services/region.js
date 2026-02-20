'use server';
import { ApiResponse } from '@/dto/Success';
import { publicApi } from '../axiosInstance';
import { ApiError } from '@/dto/Error';

/**
 * Get all regions.
 * @returns {Promise<{success: boolean, data?: any, status?: number, message?: string, errors?: any}>}
 */
export const getAllRegions = async () => {
  try {
    const response = await publicApi(`/api/region/`);
    if (response.status === 200) {
      return ApiResponse({
        data: response.data,
        status: 200,
        success: true,
      });
    }

    return ApiError({
      message: response.data?.message || 'Unexpected error occurred',
      status: response.status,
      errors: response.data?.errors,
    });
  } catch (error) {
    return ApiError({
      message: error.response?.data?.message || 'Failed to fetch reviews',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || error.message,
    });
  }
};

/**
 * This method return the region details
 * @param {*} region
 * @returns []
 */
export const fetchRegionDetails = async (region) => {
  try {
    const response = await publicApi(`api/region/${region}`);
    return response?.data?.data;
  } catch (error) {
    console.error('Error fetching region details:', error);
    return [];
  }
};

/**
 * Get All Cities of Region
 * @param {string} region region slug
 * @returns []
 */
export const getCitiesByRegion = async (region) => {
  try {
    const response = await publicApi.get(`/api/region/${region}/cities/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching city data:');

    return [];
  }
};

/**
 * Get Region All Items
 * @param {string} region region of the items
 * @param {string} query query params
 * @return {}
 */

export const getItemsByRegion = async (region, query = '') => {
  try {
    const response = await publicApi.get(`/api/region/${region}/region-all-items${query}/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching city data:');

    return {};
  }
};
