import { authApi } from '@/lib/axiosInstance';
import { log } from '@/lib/utils';

/**
 * Get All Orders By Customer
 * @param {string} search search query if exist
 * @returns {}
 */
export async function getAllOrdersCustomer(search = '') {
  try {
    const res = await authApi.get(`/api/customer/userorders/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });

    // for handling diffrent response
    if (res.status === 200) return res.data;
    if (res.status === 404) return {}; // not found

    return {}; // fallback for other statuses
  } catch (error) {
    return {};
  }
}
