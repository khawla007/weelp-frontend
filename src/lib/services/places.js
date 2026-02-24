import { authApi, createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get Destination Places *** {dropdowns} Form Oriented ***
 * @returns {Promise<{ success:boolean,data:[] }>} -Api For For All Vendor driver list data for form handling form purpose e.g... {dropdowns, selects,etc}
 */
export async function getPlacesByAdminOptions() {
  try {
    const response = await authApi.get(`/api/admin/places/list`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }

    return {};
  } catch (error) {
    console.error('Service Error:', error);
    throw new Error('Failed to fetch data from backend server');
  }
}

/**
 * Fetches a list of Places for admin with optional query parameters.
 * @function
 * @param {string} [search=""] - Optional query string (must start with `?`).
 *   Example: "?name=india&page=2"
 * @returns {Promise<Object>} Returns the API response data if successful, otherwise returns an empty object.
 *
 * @example
 * const states = await getAllPlacesAdmin("?name=india&page=2");
 */
export async function getAllPlacesAdmin(search = '') {
  try {
    const response = await authApi.get(`/api/admin/places/${search}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return {};
  }
}

/**
 * Get Single Place on Admin side
 * @param {Number} id
 * @returns {Promise<object>} - Place data or empty object if not found
 */
export async function getSinglePlaceAdmin(id) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/places/${id}`, {
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
