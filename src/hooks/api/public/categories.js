import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

/**
 * Method is For Retrieving Public Categories Using Proxy Api
 * @returns {}
 */
export function useCategories() {
  const { data = {}, error, isValidating, isLoading, mutate } = useSWR(`/api/public/taxonomies/categories`, fetcher);
  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
