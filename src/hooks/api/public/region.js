import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

/**
 * SWR hook to get items by region with filters
 * @param {string} region - e.g., "asia"
 * @param {object} filters - any query params like { page: 1, min_price: 100 }
 */
export function useRegionItems(region = 'asia', filters = {}) {
  const params = new URLSearchParams({ region, ...filters });
  const queryString = params.toString(); // create query param

  const { data, error, isLoading, mutate } = useSWR(`/api/public/region/allItems?${queryString}`, fetcher);

  return {
    data: data?.data ?? [],
    pagination: {
      currentPage: data?.current_page,
      lastPage: data?.last_page,
      perPage: data?.per_page,
      total: data?.total,
    },
    isLoading,
    isError: error,
    mutate,
  };
}
