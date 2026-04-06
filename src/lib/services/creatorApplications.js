import { createAuthenticatedServerApi } from '../axiosInstance';

/**
 * Get all creator applications (admin)
 * @param {string} status - Filter by status
 * @param {number} page - Page number
 * @returns {object} Paginated applications
 */
export async function getCreatorApplications(status = '', page = 1) {
  try {
    const api = await createAuthenticatedServerApi();
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', page);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/api/admin/creator-applications${query}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return { success: false, data: [], message: 'Failed to fetch creator applications' };
  }
}

/**
 * Get a single creator application (admin)
 * @param {number} id - Application ID
 * @returns {object} Application data
 */
export async function getCreatorApplication(id) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/creator-applications/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return {};
  }
}
