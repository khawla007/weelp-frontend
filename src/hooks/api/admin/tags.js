import { fetcher } from '@/lib/fetchers';
import useSWR from 'swr';

/**
 * Custom React hook to fetch all admin tags options from the API.
 *
 * Uses SWR for caching, revalidation, and optimized fetching.
 *
 * @returns {{
 *   tagList: any[],                     // The list of fetched tags (defaults to empty array).
 *   isLoading: boolean,                // Whether the data is currently being loaded for the first time.
 *   isValidating: boolean,             // Whether the data is being revalidated in the background.
 *   error: any,                        // Error object if the fetch fails.
 *   mutate: () => void                 // Function to manually revalidate or update the data.
 * }}
 */
export function useAlltagsOptionsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/taxonomies/tags/tagsdropdown', fetcher);

  return {
    tagList: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
