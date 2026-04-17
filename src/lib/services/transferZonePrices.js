import { getAuthApi } from '../axiosInstance';

export async function getTransferZonePriceMatrix() {
  try {
    const api = await getAuthApi();
    const response = await api.get('/api/admin/transfer-zone-prices', {
      headers: { Accept: 'application/json' },
    });
    return response?.data ?? { zones: [], cells: [] };
  } catch (error) {
    console.error('Service Error (getTransferZonePriceMatrix):', error?.message || error);
    return { zones: [], cells: [] };
  }
}
