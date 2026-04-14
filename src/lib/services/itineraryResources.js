import { publicApi, authApi } from '../axiosInstance';

/**
 * Get cities list for dropdown (public endpoint)
 * @param {Object} params - Query parameters (search, per_page)
 * @returns {Promise<Object>}
 */
export const getCitiesList = async (params = {}) => {
  try {
    const response = await publicApi.get('/api/cities', { params: { per_page: 100, ...params } });
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return { success: false, data: [] };
  }
};

/**
 * Get activities by city (public endpoint)
 * @param {number} cityId - City ID
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Object>}
 */
export const getActivitiesByCity = async (cityId, params = {}) => {
  try {
    const response = await publicApi.get('/api/activities', {
      params: { city_id: cityId, ...params },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return { success: false, data: [] };
  }
};

/**
 * Get transfers by city (public endpoint)
 * @param {number} cityId - City ID
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Object>}
 */
export const getTransfersByCity = async (cityId, params = {}) => {
  try {
    const response = await publicApi.get('/api/transfers', {
      params: { city_id: cityId, ...params },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return { success: false, data: [] };
  }
};

/**
 * Get places by city (public endpoint)
 * @param {number} cityId - City ID
 * @returns {Promise<Object>}
 */
export const getPlacesByCity = async (cityId) => {
  try {
    const response = await publicApi.get('/api/places', {
      params: { city_id: cityId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching places:', error);
    return { success: false, data: [] };
  }
};
