import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

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
