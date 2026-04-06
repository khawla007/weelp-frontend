'use server';

import { getAuthApi, publicApi } from '../axiosInstance';

/**
 * Submit a creator itinerary
 * @param {object} data - Itinerary data
 * @returns {object} { success, message, data }
 */
export const submitCreatorItinerary = async (data) => {
  try {
    const api = await getAuthApi();
    const res = await api.post('/api/creator/itineraries', data);
    return { success: true, message: res.data?.message, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to submit itinerary.';
    return { success: false, message };
  }
};

/**
 * Get itinerary edit data
 * @param {string} slug - Itinerary slug
 * @returns {object} { success, data }
 */
export const getEditData = async (slug) => {
  try {
    const api = await getAuthApi();
    const res = await api.get(`/api/itineraries/${slug}/edit-data`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to fetch edit data.';
    return { success: false, message };
  }
};

/**
 * Get city activities for an itinerary
 * @param {string} slug - Itinerary slug
 * @returns {object} { success, data }
 */
export const getCityActivities = async (slug) => {
  try {
    const api = await getAuthApi();
    const res = await api.get(`/api/itineraries/${slug}/city-activities`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to fetch city activities.';
    return { success: false, message };
  }
};

/**
 * Get city transfers for an itinerary
 * @param {string} slug - Itinerary slug
 * @returns {object} { success, data }
 */
export const getCityTransfers = async (slug) => {
  try {
    const api = await getAuthApi();
    const res = await api.get(`/api/itineraries/${slug}/city-transfers`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to fetch city transfers.';
    return { success: false, message };
  }
};

/**
 * Get city places for an itinerary
 * @param {string} slug - Itinerary slug
 * @returns {object} { success, data }
 */
export const getCityPlaces = async (slug) => {
  try {
    const api = await getAuthApi();
    const res = await api.get(`/api/itineraries/${slug}/city-places`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to fetch city places.';
    return { success: false, message };
  }
};

/**
 * Toggle like on a creator itinerary
 * @param {number} id - Itinerary ID
 * @returns {object} { success, liked, likes_count }
 */
export const toggleItineraryLike = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.post(`/api/explore/creator-itineraries/${id}/like`);
    return { success: true, liked: res.data?.liked, likes_count: res.data?.likes_count };
  } catch (err) {
    return { success: false, message: 'Failed to toggle like.' };
  }
};

/**
 * Record a view on a creator itinerary
 * @param {number} id - Itinerary ID
 * @returns {object} { success }
 */
export const recordItineraryView = async (id) => {
  try {
    const res = await publicApi.post(`/api/explore/creator-itineraries/${id}/view`);
    return { success: true, views_count: res.data?.views_count };
  } catch (err) {
    return { success: false, message: 'Failed to record view.' };
  }
};

/**
 * Get creator dashboard stats
 * @returns {object} { success, data }
 */
export const getCreatorDashboardStats = async () => {
  try {
    const api = await getAuthApi();
    const res = await api.get('/api/creator/dashboard/stats');
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, message: 'Failed to fetch stats.' };
  }
};

/**
 * Approve a creator itinerary (admin)
 * @param {number} id - Itinerary ID
 * @returns {object} { success, message }
 */
export const approveCreatorItinerary = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/creator-itineraries/${id}/approve`);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to approve itinerary.';
    return { success: false, message };
  }
};

/**
 * Reject a creator itinerary (admin)
 * @param {number} id - Itinerary ID
 * @returns {object} { success, message }
 */
export const rejectCreatorItinerary = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/creator-itineraries/${id}/reject`);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to reject itinerary.';
    return { success: false, message };
  }
};

/**
 * Get all creator itineraries (admin)
 * @param {string} status - Filter by status
 * @param {number} page - Page number
 * @returns {object} { success, data }
 */
export const getAdminCreatorItineraries = async (status = '', page = 1) => {
  try {
    const api = await getAuthApi();
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', page);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/api/admin/creator-itineraries${query}`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: 'Failed to fetch creator itineraries.' };
  }
};

/**
 * Get a single creator itinerary (admin)
 * @param {number} id - Itinerary ID
 * @returns {object} { success, data }
 */
export const getAdminCreatorItinerary = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.get(`/api/admin/creator-itineraries/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, message: 'Failed to fetch creator itinerary.' };
  }
};

/**
 * Get the original version of a creator itinerary (admin)
 * @param {number} id - Itinerary ID
 * @returns {object} { success, data }
 */
export const getAdminCreatorItineraryOriginal = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.get(`/api/admin/creator-itineraries/${id}/original`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, message: 'Failed to fetch original itinerary.' };
  }
};
