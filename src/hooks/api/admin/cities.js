import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useCitiesOptionsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/destinations/cities/citiesdropdown', fetcher);
  return {
    cities: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
