import useSWR from 'swr';
import axios from 'axios';

import { fetcher } from '@/lib/fetchers';

const adminOrderDetailFetcher = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    const status = axios.isAxiosError(error) ? (error.response?.status ?? null) : null;
    const detailError = new Error(status === 404 ? 'Order not found.' : 'We could not load this order.');
    detailError.status = status;
    throw detailError;
  }
};

export function useAllOrdersAdmin(query = '') {
  const { data, error, isValidating, isLoading, mutate } = useSWR(`/api/admin/orders${query}`, fetcher);
  return {
    orders: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

export function useAdminOrder(orderId) {
  const key = orderId ? `/api/admin/orders/${orderId}` : null;
  const { data, error, isLoading, mutate } = useSWR(key, adminOrderDetailFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    errorRetryCount: 0,
  });

  return {
    order: data?.data ?? null,
    isLoading,
    error,
    errorStatus: error?.status ?? null,
    mutate,
  };
}
