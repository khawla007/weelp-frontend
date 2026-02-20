import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useAllPackagesAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/packages', fetcher);

  return {
    packages: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
