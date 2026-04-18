import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Search public locations (cities + places) for the public-facing search form.
 * Hits the backend route: GET /api/public/locations/search
 *
 * @param {string} q - Search query string.
 * @param {string} types - Comma-separated locatable types (e.g. 'city,place').
 * @param {number} limit - Max results to return.
 * @returns {Promise<Array>} Array of location objects with
 *   { locatable_type, locatable_id, name, type, city_name, country_name, ... }.
 */
export async function searchPublicLocations(q = '', types = 'city,place', limit = 15) {
  try {
    const res = await axios.get(`${API_URL}/api/public/locations/search`, {
      params: { q, types, limit },
    });
    return res?.data?.data ?? [];
  } catch (err) {
    console.error('[searchPublicLocations]', err);
    return [];
  }
}
