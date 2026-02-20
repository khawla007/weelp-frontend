import { publicApi, createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get Single State on Admin side
 * @param {Number} id
 @returns {Promise<object>} - State data or empty object if not found
 */
export async function getSingleStateAdmin(id) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/states/${id}`, {
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
 * Fetches a list of states for admin with optional query parameters.
 *
 * @function
 * @param {string} [search=""] - Optional query string (must start with `?`).
 *   Example: "?name=india&page=2"
 * @returns {Promise<Object>} Returns the API response data if successful, otherwise returns an empty object.
 *
 * @example
 * const states = await getAllStatesAdmin("?name=india&page=2");
 */
export async function getAllStatesAdmin(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/states/${search}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return {};
  }
}

/**
 * Get State Options
 * @returns {Promise<{ success:boolean,data:[], total:number, current_page:number,per_page:number,total:number }>} - All State list data for form handling purpose e.g... {dropdowns, selects,etc}
 */
export async function getStatesOptionsAdmin() {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/states/list`, {
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
