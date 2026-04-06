'use server';

import { getAuthApi } from '../axiosInstance';

/**
 * Save a customer itinerary (customized from a creator itinerary)
 * @param {object} data - Itinerary data with modified schedules
 * @returns {object} { success, message, data }
 */
export const saveCustomerItinerary = async (data) => {
  try {
    const api = await getAuthApi();
    const res = await api.post('/api/customer/itineraries', data);
    return { success: true, message: res.data?.message, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to save itinerary.';
    return { success: false, message };
  }
};

/**
 * Get the current customer's saved itineraries
 * @param {number} page - Page number
 * @returns {object} { success, data }
 */
export const getMyItineraries = async (page = 1) => {
  try {
    const api = await getAuthApi();
    const res = await api.get(`/api/customer/my-itineraries?page=${page}`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: 'Failed to fetch itineraries.', data: [] };
  }
};
