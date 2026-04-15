import { publicApi, getAuthApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get All Transfers Admin
 * @param ##
 * @returns {}
 */
export async function getAllTransfersAdmin() {
  try {
    const api = await getAuthApi();
    const response = await api.get(`/api/admin/transfers?all=true`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data?.data ?? [];
  } catch (error) {
    return [];
  }
}

/**
 * Get All Transfers for Creator role
 * Uses the creator endpoint (auth + creator middleware) which returns
 * transfers shaped like the admin endpoint (with vendor_routes.pickup_city_id)
 * so the shared ActivitySearchModal/TransferSearchModal markup works unchanged.
 * @returns {Promise<Array>}
 */
export async function getAllTransfersCreator() {
  try {
    const api = await getAuthApi();
    const response = await api.get(`/api/creator/transfers`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data?.data ?? [];
  } catch (error) {
    console.error('Service Error (getAllTransfersCreator):', error);
    return [];
  }
}

/**
 * Get All Transfers List from Public API (for creators/guests)
 * Uses the public endpoint which doesn't require admin authentication
 * @returns {Promise<{ data: Array }>}
 */
export async function getAllTransfersPublic() {
  try {
    const response = await publicApi.get(`/api/transfers`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    console.error('Service Error (getAllTransfersPublic):', error);
    return { success: false, data: [] };
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
    const api = await getAuthApi();
    const url = search ? `/api/admin/transfers${search}` : `/api/admin/transfers`;
    const response = await api.get(url, {
      headers: { Accept: 'application/json' },
    });

    return response?.data;
  } catch (error) {
    return { data: [] };
  }
}

/**
 * Get Single Transfer on Admin side
 * @param {Number} transferId
 * @returns {Promise<Object|Array>} Returns the API response data if successful, otherwise returns an empty array.
 */
export async function getSingleTransferAdmin(transferId = '') {
  try {
    const api = await getAuthApi();
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
