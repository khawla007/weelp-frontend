import { getAuthApi } from '../axiosInstance';

/**
 * Fetch all transfer zones (admin)
 * @param {string} [query=""] - Optional query string (e.g., "?page=1&per_page=25&q=airport")
 */
export async function getAllTransferZonesAdmin(query = '') {
  try {
    const api = await getAuthApi();
    const response = await api.get(`/api/admin/transfer-zones${query}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data ?? { data: [] };
  } catch (error) {
    console.error('Service Error (getAllTransferZonesAdmin):', error?.message || error);
    return { data: [] };
  }
}

/**
 * Fetch single transfer zone by id
 */
export async function getSingleTransferZoneAdmin(id) {
  try {
    const api = await getAuthApi();
    const response = await api.get(`/api/admin/transfer-zones/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data ?? null;
  } catch (error) {
    console.error('Service Error (getSingleTransferZoneAdmin):', error?.message || error);
    return null;
  }
}

/**
 * Get lightweight zones list (for pickers / matrix headers)
 */
export async function getTransferZonesList() {
  try {
    const api = await getAuthApi();
    const response = await api.get(`/api/admin/transfer-zones?per_page=500`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data?.data ?? [];
  } catch (error) {
    console.error('Service Error (getTransferZonesList):', error?.message || error);
    return [];
  }
}
