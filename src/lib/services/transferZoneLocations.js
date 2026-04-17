import { getAuthApi } from '../axiosInstance';

const EMPTY_PAGE = { data: [], current_page: 1, per_page: 15, total: 0, last_page: 1 };

/**
 * Fetch locations for a transfer zone (admin)
 * @param {string|number} zoneId
 * @param {string} [query=""] - Optional query string (e.g., "?q=dubai&type=airport&filter=unassigned&page=1")
 */
export async function getZoneLocations(zoneId, query = '') {
  try {
    const api = await getAuthApi();
    const response = await api.get(`/api/admin/transfer-zones/${zoneId}/locations${query}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data ?? EMPTY_PAGE;
  } catch (error) {
    console.error('Service Error (getZoneLocations):', error?.message || error);
    return EMPTY_PAGE;
  }
}
