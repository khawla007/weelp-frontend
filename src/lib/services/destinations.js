import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch counts for all destination types
 * @returns {Promise<{success: boolean, data: {countries: number, states: number, cities: number, places: number}}>}
 */
export async function getDestinationsCounts() {
  const response = await axios.get(`${API_URL}/api/admin/destinations/counts`);
  return response.data;
}
