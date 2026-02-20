import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

/**
 * Custom React hook to fetch attribute data by slug from the admin API.
 *
 * Uses SWR for data fetching with caching and revalidation.
 *
 * @param {string} attributeSlug - The slug of the attribute to fetch (e.g., "difficulty-level").
 * @returns {{
 *   attributes: any[] | null,
 *   isLoading: boolean,
 *   isValidating: boolean,
 *   error: any,
 *   mutate: () => void
 * }} - Fetched data and related SWR states.
 */
export function useAttributeBySlugAdmin(attributeSlug) {
  const shouldFetch = Boolean(attributeSlug);
  const { data, error, isValidating, isLoading, mutate } = useSWR(shouldFetch ? `/api/admin/taxonomies/attributes/${attributeSlug}` : null, fetcher);

  return {
    attributes: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
