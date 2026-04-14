import { authApi } from '../axiosInstance';

// ==================== EXPLORE ====================

/**
 * Get paginated explore creator itineraries
 * @param {number} page - Page number
 * @param {string} sort - Sort order (latest, oldest, top_rated, most_viewed)
 * @param {string} source - Filter by source (mine for user's own)
 * @returns {Promise<Object>}
 */
export const getExploreItineraries = async (page = 1, sort = 'latest', source = null) => {
  try {
    const params = new URLSearchParams({ page, sort });
    if (source) params.append('source', source);
    const response = await authApi.get(`/api/creator/explore?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching explore itineraries:', error);
    return { success: false, data: [], current_page: 1, last_page: 1 };
  }
};

/**
 * Get single explore itinerary details
 * @param {number} id - Itinerary ID
 * @returns {Promise<Object>}
 */
export const getExploreItinerary = async (id) => {
  try {
    const response = await authApi.get(`/api/creator/explore/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching explore itinerary:', error);
    return { success: false, message: 'Failed to fetch itinerary' };
  }
};

/**
 * Toggle like status for an itinerary
 * @param {number} id - Itinerary ID
 * @returns {Promise<Object>}
 */
export const toggleExploreLike = async (id) => {
  try {
    const response = await authApi.post(`/api/creator/explore/${id}/like`);
    return response.data;
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, message: 'Failed to toggle like' };
  }
};

/**
 * Record itinerary view
 * @param {number} id - Itinerary ID
 * @returns {Promise<Object>}
 */
export const recordExploreView = async (id) => {
  try {
    const response = await authApi.post(`/api/creator/explore/${id}/view`);
    return response.data;
  } catch (error) {
    console.error('Error recording view:', error);
    return { success: false };
  }
};

// ==================== RESOURCES ====================

/**
 * Get cities dropdown for creator
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>}
 */
export const getCreatorCities = async (params = {}) => {
  try {
    const response = await authApi.get('/api/creator/cities', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching creator cities:', error);
    return { success: false, data: [] };
  }
};

/**
 * Get activities by city for creator
 * @param {number} cityId - City ID
 * @param {Object} params - Additional parameters
 * @returns {Promise<Object>}
 */
export const getCreatorActivities = async (cityId, params = {}) => {
  try {
    const response = await authApi.get('/api/creator/activities', {
      params: { city_id: cityId, ...params },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching creator activities:', error);
    return { success: false, data: [] };
  }
};

/**
 * Get transfers by city for creator
 * @param {number} cityId - City ID
 * @returns {Promise<Object>}
 */
export const getCreatorTransfers = async (cityId) => {
  try {
    const response = await authApi.get('/api/creator/transfers', {
      params: { city_id: cityId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching creator transfers:', error);
    return { success: false, data: [] };
  }
};

// ==================== EDITING ====================

/**
 * Get itinerary data for editing (creator)
 * @param {string} slug - Itinerary slug
 * @returns {Promise<Object>}
 */
export const getCreatorItineraryEditData = async (slug) => {
  try {
    const response = await authApi.get(`/api/creator/itineraries/edit/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching edit data:', error);
    return { success: false, message: 'Failed to fetch edit data' };
  }
};

// ==================== DRAFTS ====================

/**
 * Create new itinerary draft
 * @param {Object} data - Draft data
 * @returns {Promise<Object>}
 */
export const createItineraryDraft = async (data) => {
  try {
    const response = await authApi.post('/api/creator/itineraries', data);
    return response.data;
  } catch (error) {
    console.error('Error creating draft:', error);
    return { success: false, message: 'Failed to create draft' };
  }
};

/**
 * Update itinerary draft
 * @param {number} id - Draft ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>}
 */
export const updateItineraryDraft = async (id, data) => {
  try {
    const response = await authApi.put(`/api/creator/itineraries/drafts/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating draft:', error);
    return { success: false, message: 'Failed to update draft' };
  }
};

/**
 * Submit draft for approval
 * @param {number} id - Draft ID
 * @returns {Promise<Object>}
 */
export const submitItineraryDraft = async (id) => {
  try {
    const response = await authApi.post(`/api/creator/itineraries/drafts/${id}/submit`);
    return response.data;
  } catch (error) {
    console.error('Error submitting draft:', error);
    return { success: false, message: 'Failed to submit draft' };
  }
};

// ==================== MY ITINERARIES ====================

/**
 * Get creator's own itineraries
 * @param {Object} params - Query parameters (page, status)
 * @returns {Promise<Object>}
 */
export const getCreatorMyItineraries = async (params = {}) => {
  try {
    const response = await authApi.get('/api/creator/my-itineraries', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my itineraries:', error);
    return { success: false, data: [] };
  }
};

/**
 * Request edit for approved itinerary
 * @param {number} id - Itinerary ID
 * @returns {Promise<Object>}
 */
export const requestItineraryEdit = async (id) => {
  try {
    const response = await authApi.post(`/api/creator/itineraries/${id}/request-edit`);
    return response.data;
  } catch (error) {
    console.error('Error requesting edit:', error);
    return { success: false, message: 'Failed to request edit' };
  }
};

/**
 * Request removal of itinerary
 * @param {number} id - Itinerary ID
 * @param {string} reason - Removal reason
 * @returns {Promise<Object>}
 */
export const requestItineraryRemoval = async (id, reason) => {
  try {
    const response = await authApi.post(`/api/creator/itineraries/${id}/request-removal`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error requesting removal:', error);
    return { success: false, message: 'Failed to request removal' };
  }
};
