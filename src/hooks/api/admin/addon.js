import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useAddOnOptionsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/addons/addondropdown', fetcher);
  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
