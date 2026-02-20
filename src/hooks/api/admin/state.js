import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useStatesOptionsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/destinations/states/statesdropdown', fetcher);
  return {
    states: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
