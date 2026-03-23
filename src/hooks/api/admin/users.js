import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useAllUsersAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/users?per_page=500', fetcher);

  return {
    users: data || {},
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
