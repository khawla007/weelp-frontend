import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useAllOrdersCustomer(query = '') {
  const { data, error, isValidating, isLoading, mutate } = useSWR(`/api/customer/orders${query}`, fetcher);
  return {
    orders: data || {},
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
