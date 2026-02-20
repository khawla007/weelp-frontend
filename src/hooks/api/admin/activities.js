import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useAllActivitiesAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/activities', fetcher);
  return {
    activities: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
