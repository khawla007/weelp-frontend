import { publicApi, createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get Single Country on Admin side
 * @param {Number} id
 @returns {Promise<object>} - Country data or empty object if not found
 */
export async function getSingleCountryAdmin(id) {
  console.log('[getSingleCountryAdmin] Starting for ID:', id);

  try {
    // Import auth freshly each time to avoid caching issues
    const { auth } = await import('../auth/auth');
    const session = await auth();

    console.log('[getSingleCountryAdmin] Session check:', {
      hasSession: !!session,
      hasToken: !!session?.access_token,
      userEmail: session?.user?.email,
      tokenPreview: session?.access_token?.substring(0, 30) + '...',
    });

    // Create axios instance directly here instead of using helper
    const axios = (await import('axios')).default;
    const api = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
    });

    const response = await api.get(`/api/admin/countries/${id}`, {
      headers: { Accept: 'application/json' },
    });

    console.log('[getSingleCountryAdmin] SUCCESS:', response.status, 'countryName:', response.data?.name);

    if (response.status === 200) {
      return response.data;
    }
    return { _error: `Status ${response.status}`, _status: response.status };
  } catch (error) {
    console.error('[getSingleCountryAdmin] ERROR:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return {
      _error: error.message,
      _status: error.response?.status,
      _data: error.response?.data,
    };
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
