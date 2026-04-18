import { getAuthApi } from '../axiosInstance';

export async function getAllTransferRoutesAdmin(query = '') {
  try {
    const api = await getAuthApi();
    const response = await api.get(`/api/admin/transfer-routes${query}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data ?? { data: [] };
  } catch (error) {
    console.error('Service Error (getAllTransferRoutesAdmin):', error?.message || error);
    return { data: [] };
  }
}

export async function getSingleTransferRouteAdmin(id) {
  try {
    const api = await getAuthApi();
    const response = await api.get(`/api/admin/transfer-routes/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data ?? null;
  } catch (error) {
    console.error('Service Error (getSingleTransferRouteAdmin):', error?.message || error);
    return null;
  }
}

export async function getTransferRoutesDropdown() {
  try {
    const api = await getAuthApi();
    const response = await api.get('/api/admin/transfer-routes/dropdown', {
      headers: { Accept: 'application/json' },
    });
    return response?.data?.data ?? [];
  } catch (error) {
    console.error('Service Error (getTransferRoutesDropdown):', error?.message || error);
    return [];
  }
}

export async function searchAdminLocations(q = '', types = 'city,place', limit = 20) {
  try {
    const api = await getAuthApi();
    const params = new URLSearchParams({ q, types, limit });
    const response = await api.get(`/api/admin/locations/search?${params}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data?.data ?? [];
  } catch (error) {
    console.error('Service Error (searchAdminLocations):', error?.message || error);
    return [];
  }
}
