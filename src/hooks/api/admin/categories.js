import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

/**
 * Custom React hook to fetch all admin categories from the API.
 *
 * Uses SWR for caching, revalidation, and optimized fetching.
 *
 * @returns {{
 *   categories: any[],              // The list of fetched categories (defaults to empty array).
 *   isLoading: boolean,            // Whether the data is currently being loaded for the first time.
 *   isValidating: boolean,         // Whether the data is being revalidated in the background.
 *   error: any,                    // Error object if the fetch fails.
 *   mutate: () => void             // Function to manually revalidate or update the data.
 * }}
 */
export function useAllCategoriesAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/taxonomies/categories/', fetcher);

  return {
    categories: data?.data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

/**
 * Custom React hook to fetch all admin categories options from the API.
 *
 * Uses SWR for caching, revalidation, and optimized fetching.
 *
 * @returns {{
 *   categoriesList: any[],              // The list of fetched categories (defaults to empty array).
 *   isLoading: boolean,                // Whether the data is currently being loaded for the first time.
 *   isValidating: boolean,             // Whether the data is being revalidated in the background.
 *   error: any,                        // Error object if the fetch fails.
 *   mutate: () => void                 // Function to manually revalidate or update the data.
 * }}
 */
export function useAllCategoriesOptionsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/taxonomies/categories/categoriesdropdown', fetcher);

  return {
    categoriesList: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
