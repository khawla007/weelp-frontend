import useSWR from 'swr';
import { authApi } from '@/lib/axiosInstance';

// Static SWR key base
const ORDERS_KEY = '/api/customer/userorders';
export const CUSTOMER_ORDERS_PER_PAGE = 6;
const EMPTY_ORDERS_RESPONSE = { success: true, orders: [], pagination: { total: 0, per_page: CUSTOMER_ORDERS_PER_PAGE, current_page: 1, last_page: 1 } };

// Custom fetcher defined inline to avoid import issues
const ordersFetcher = async (url) => {
  try {
    const res = await authApi.get(url);
    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return EMPTY_ORDERS_RESPONSE;
    }
    throw error;
  }
};

const orderDetailFetcher = async (url) => {
  const response = await authApi.get(url);
  return response.data;
};

export function useAllOrdersCustomer(page = 1) {
  // Build query string with pagination
  const query = `?page=${page}&per_page=${CUSTOMER_ORDERS_PER_PAGE}`;
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
    orders: error ? null : data || EMPTY_ORDERS_RESPONSE,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

export function useCustomerOrder(orderId) {
  const key = orderId ? `${ORDERS_KEY}/${orderId}` : null;
  const { data, error, isLoading, mutate } = useSWR(key, orderDetailFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    errorRetryCount: 0,
  });

  return {
    order: data?.order ?? null,
    isLoading,
    error,
    mutate,
  };
}
