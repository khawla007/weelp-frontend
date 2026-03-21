import { getAuthApi } from '@/lib/axiosInstance';

/**
 * Get All Orders By Customer
 * @param {string} search search query if exist
 * @returns {}
 */
export async function getAllOrdersCustomer(search = '') {
  try {
    const api = await getAuthApi();
    const res = await api.get(`/api/customer/userorders/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });

    if (res.status === 200) return res.data;
    if (res.status === 404) return {};

    return {};
  } catch (error) {
    return {};
  }
}
