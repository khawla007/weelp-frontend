import useSWR from 'swr';
import { authApi } from '@/lib/axiosInstance';

// Static SWR key base
const ORDERS_KEY = '/api/customer/userorders';

// Custom fetcher defined inline to avoid import issues
const ordersFetcher = async (url) => {
  try {
    const res = await authApi.get(url);
    return res.data;
  } catch (error) {
    // Return null on error to prevent infinite retries
    if (error.response?.status === 401 || error.response?.status === 404) {
      return { success: true, orders: [], pagination: { total: 0, per_page: 6, current_page: 1, last_page: 1 } };
    }
    throw error;
  }
};

export function useAllOrdersCustomer(page = 1) {
  // Build query string with pagination
  const query = `?page=${page}&per_page=6`;
  const key = `${ORDERS_KEY}${query}`;

  const { data, error, isValidating, isLoading, mutate } = useSWR(key, ordersFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    dedupingInterval: 10000,
    errorRetryCount: 0,
    refreshInterval: 0,
  });
  return {
    orders: data || { success: true, orders: [], pagination: { total: 0, per_page: 6, current_page: 1, last_page: 1 } },
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
