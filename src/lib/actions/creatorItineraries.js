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
    const res = await publicApi.get(`/api/itineraries/${slug}/city-activities`);
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
    const res = await publicApi.get(`/api/itineraries/${slug}/city-transfers`);
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
    const res = await publicApi.get(`/api/itineraries/${slug}/city-places`);
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
    return { success: true, data: res.data?.data };
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

/**
 * Request edit (creates a draft copy) for an approved creator itinerary
 * @param {number} id - Itinerary ID
 * @returns {object} { success, message, data }
 */
export const requestEdit = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.post(`/api/creator/itineraries/${id}/request-edit`);
    return { success: true, message: res.data?.message, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to create edit draft.';
    return { success: false, message };
  }
};

/**
 * Get a draft itinerary for editing
 * @param {number} id - Draft itinerary ID
 * @returns {object} { success, data }
 */
export const getDraftItinerary = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.get(`/api/creator/itineraries/drafts/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, message: 'Failed to fetch draft.' };
  }
};

/**
 * Save draft edits (name, description, schedules)
 * @param {number} id - Draft itinerary ID
 * @param {object} data - { name?, description?, schedules? }
 * @returns {object} { success, message, data }
 */
export const updateDraft = async (id, data) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/creator/itineraries/drafts/${id}`, data);
    return { success: true, message: res.data?.message, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to update draft.';
    return { success: false, message };
  }
};

/**
 * Submit a draft for admin review
 * @param {number} id - Draft itinerary ID
 * @returns {object} { success, message }
 */
export const submitDraft = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/creator/itineraries/drafts/${id}/submit`);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to submit draft.';
    return { success: false, message };
  }
};

/**
 * Request removal of an approved creator itinerary
 * @param {number} id - Itinerary ID
 * @param {string|null} reason - Optional reason for removal
 * @returns {object} { success, message }
 */
export const requestRemoval = async (id, reason = null) => {
  try {
    const api = await getAuthApi();
    const res = await api.post(`/api/creator/itineraries/${id}/request-removal`, { reason });
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to request removal.';
    return { success: false, message };
  }
};

/**
 * Admin: update a creator itinerary (full edit)
 * @param {number} id - Itinerary ID
 * @param {object} data - Full itinerary data
 * @returns {object} { success, message }
 */
export const adminUpdateCreatorItinerary = async (id, data) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/creator-itineraries/${id}/update`, data);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to update itinerary.';
    return { success: false, message };
  }
};

/**
 * Admin: delete a creator itinerary
 * @param {number} id - Itinerary ID
 * @returns {object} { success, message }
 */
export const adminDeleteCreatorItinerary = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.delete(`/api/admin/creator-itineraries/${id}`);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to delete itinerary.';
    return { success: false, message };
  }
};

/**
 * Admin: approve an edit draft
 * @param {number} id - Itinerary ID (the approved one, not the draft)
 * @returns {object} { success, message }
 */
export const adminApproveEdit = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/creator-itineraries/${id}/approve-edit`);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to approve edit.';
    return { success: false, message };
  }
};

/**
 * Admin: reject an edit draft
 * @param {number} id - Itinerary ID (the approved one, not the draft)
 * @returns {object} { success, message }
 */
export const adminRejectEdit = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/creator-itineraries/${id}/reject-edit`);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to reject edit.';
    return { success: false, message };
  }
};

/**
 * Admin: approve a removal request
 * @param {number} id - Itinerary ID
 * @returns {object} { success, message }
 */
export const adminApproveRemoval = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/creator-itineraries/${id}/approve-removal`);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to approve removal.';
    return { success: false, message };
  }
};

/**
 * Admin: reject a removal request
 * @param {number} id - Itinerary ID
 * @returns {object} { success, message }
 */
export const adminRejectRemoval = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/creator-itineraries/${id}/reject-removal`);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to reject removal.';
    return { success: false, message };
  }
};

/**
 * Get diff data for admin review (approved + draft)
 * @param {number} id - Approved itinerary ID
 * @returns {object} { success, data: { approved, draft } }
 */
export const getCreatorItineraryDiff = async (id) => {
  try {
    const api = await getAuthApi();
    const approvedRes = await api.get(`/api/admin/creator-itineraries/${id}`);
    const approved = approvedRes.data?.data;
    if (!approved?.draft_itinerary_id) {
      return { success: false, message: 'No pending edit draft found.' };
    }
    const draftRes = await api.get(`/api/admin/creator-itineraries/${approved.draft_itinerary_id}`);
    return {
      success: true,
      data: { approved, draft: draftRes.data?.data },
    };
  } catch (err) {
    return { success: false, message: 'Failed to fetch diff data.' };
  }
};
