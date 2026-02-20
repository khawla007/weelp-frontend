import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useAllMediaAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/media', fetcher, { revalidateOnFocus: true });

  return {
    media: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
