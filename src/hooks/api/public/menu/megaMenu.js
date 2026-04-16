import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useMegaMenu() {
  const {
    data = {},
    error,
    isLoading,
    isValidating,
  } = useSWR('/api/mega-menu', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    regions: Array.isArray(data?.data) ? data.data : [],
    trending: Array.isArray(data?.trending) ? data.trending : [],
    error,
    isLoading,
    isValidating,
  };
}
