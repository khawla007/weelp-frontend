import { authApi } from '../axiosInstance';

// ==================== RESOURCES ====================

/**
 * Get cities dropdown for customer
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>}
 */
export const getCustomerCities = async (params = {}) => {
  try {
    const response = await authApi.get('/api/customer/cities', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer cities:', error);
    return { success: false, data: [] };
  }
};

/**
 * Get activities by city for customer
 * @param {number} cityId - City ID
 * @param {Object} params - Additional parameters
 * @returns {Promise<Object>}
 */
export const getCustomerActivities = async (cityId, params = {}) => {
  try {
    const response = await authApi.get('/api/customer/activities', {
      params: { city_id: cityId, ...params },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer activities:', error);
    return { success: false, data: [] };
  }
};

/**
 * Get transfers by city for customer
 * @param {number} cityId - City ID
 * @returns {Promise<Object>}
 */
export const getCustomerTransfers = async (cityId) => {
  try {
    const response = await authApi.get('/api/customer/transfers', {
      params: { city_id: cityId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer transfers:', error);
    return { success: false, data: [] };
  }
};

// ==================== EDITING ====================

/**
 * Get itinerary data for editing (customer)
 * @param {string} slug - Itinerary slug
 * @returns {Promise<Object>}
 */
export const getCustomerItineraryEditData = async (slug) => {
  try {
    const response = await authApi.get(`/api/customer/itineraries/edit/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching edit data:', error);
    return { success: false, message: 'Failed to fetch edit data' };
  }
};

// ==================== SAVE & BOOK ====================

/**
 * Save customized itinerary copy
 * @param {Object} data - Itinerary data with schedules
 * @returns {Promise<Object>}
 */
export const saveCustomizedItinerary = async (data) => {
  try {
    const response = await authApi.post('/api/customer/itineraries/save', data);
    return response.data;
  } catch (error) {
    console.error('Error saving customized itinerary:', error);
    return { success: false, message: 'Failed to save itinerary' };
  }
};

/**
 * Book an itinerary
 * @param {Object} data - Booking data
 * @returns {Promise<Object>}
 */
export const bookItinerary = async (data) => {
  try {
    const response = await authApi.post('/api/customer/itineraries/book', data);
    return response.data;
  } catch (error) {
    console.error('Error booking itinerary:', error);
    return { success: false, message: 'Failed to book itinerary' };
  }
};

// ==================== MY ITINERARIES ====================

/**
 * Get customer's saved itineraries
 * @param {Object} params - Query parameters (page, status)
 * @returns {Promise<Object>}
 */
export const getCustomerMyItineraries = async (params = {}) => {
  try {
    const response = await authApi.get('/api/customer/my-itineraries', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my itineraries:', error);
    return { success: false, data: [] };
  }
};
