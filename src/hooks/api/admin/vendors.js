import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useAllVendorsAdmin(query = '') {
  const key = `/api/admin/vendors/getallvendors${query}`;

  const { data, error, isValidating, isLoading, mutate } = useSWR(key, fetcher);

  return {
    vendors: data || {}, // returning the full object which includes .data, .total, etc.
    isLoading,
    isValidating,
    error,
    key,
    mutate,
  };
}
