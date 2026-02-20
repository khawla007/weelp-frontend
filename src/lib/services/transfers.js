import { publicApi, createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get All Transfers Admin
 * @param ##
 * @returns {}
 */
export async function getAllTransfersAdmin() {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/transfers/`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data?.data;
  } catch (error) {
    return [];
  }
}

/**
 * Fetches a list of admin transfers with optional query parameters.
 *
 * @function
 * @param {string} [search=""] - Optional query string to filter transfers.
 *   Example: "?vehicle_type=sedan&capacity=5&min_price=50&max_price=150&availability_date=2025-05-10&sort_by=name_asc&page=2"
 * @returns {Promise<Object|Array>} Returns the API response data if successful, otherwise returns an empty array.
 *
 * @example
 * const transfers = await getAllTransfersAdmin("?vehicle_type=sedan&capacity=5&page=2");
 */
export async function getAllTransfersAdminn(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/transfers/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });

    return response?.data;
  } catch (error) {
    return [];
  }
}

/**
 * Get Single Transfer on Admin side
 * @param {Number} transferId
 * @returns {Promise<Object|Array>} Returns the API response data if successful, otherwise returns an empty array.
 */
export async function getSingleTransferAdmin(transferId = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/transfers/${transferId}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status == 200) {
      return response?.data;
    }

    return {};
  } catch (error) {
    return {};
  }
}
