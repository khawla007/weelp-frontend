import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useAllMediaAdmin(page = 1, perPage = 10) {
  const { data, error, isValidating, isLoading, mutate } = useSWR(
    `/api/admin/media?page=${page}&per_page=${perPage}`,
    fetcher,
    { revalidateOnFocus: true }
  );

  return {
    media: data?.data || [],
    pagination: {
      currentPage: data?.current_page || 1,
      perPage: data?.per_page || 10,
      total: data?.total || 0,
    },
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
