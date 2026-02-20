import { publicApi, createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get Single Transfer on Admin side
 * @param {Number} id
 @returns {Promise<object>} - Country data or empty object if not found
 */
export async function getSingleCountryAdmin(id) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/countries/${id}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.status === 200) {
      return response.data;
    }

    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Fetches a list of countries for admin with optional query parameters.
 *
 * @function
 * @param {string} [search=""] - Optional query string (must start with `?`).
 *   Example: "?name=india&page=2"
 * @returns {Promise<Object>} Returns the API response data if successful, otherwise returns an empty object.
 *
 * @example
 * const countries = await getAllCountriesAdmin("?name=india&page=2");
 */
export async function getAllCountriesAdmin(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/countries/${search}`, {
      headers: { Accept: 'application/json' },
    });

    return response?.data;
  } catch (error) {
    return {};
  }
}

/**
 * Get Countries Options
 * @returns {Promise<{ success:boolean,data:[], total:number, current_page:number,per_page:number,total:number }>} - All Countries list data for form handling purpose e.g... {dropdowns, selects,etc}
 */
export async function getCountriesOptionsAdmin() {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/countries/list`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data?.data || []; // extract List
    }
    return {};
  } catch (error) {
    return {};
  }
}
