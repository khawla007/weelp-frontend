import { authApi } from '@/lib/axiosInstance';

/**
 * Fetch counts for all destination types
 * @returns {Promise<{success: boolean, data: {countries: number, states: number, cities: number, places: number}}>}
 */
export async function getDestinationsCounts() {
  const response = await authApi.get('/api/admin/destinations/counts');
  return response.data;
}
