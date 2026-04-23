'use client';

import useSWR from 'swr';
import { getActivityQuote } from '@/lib/services/activites';

/**
 * Hook to fetch activity quote with SWR
 * @param {string} slug - Activity slug
 * @param {Object} options - Query options
 * @param {number} options.adults - Number of adults
 * @param {number} [options.children=0] - Number of children
 * @returns {Object} Quote data, loading/error states, and refresh function
 */
export function useActivityQuote(slug, { adults, children = 0 } = {}) {
  const shouldFetch = Boolean(slug) && Number.isFinite(adults) && adults + children > 0;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['activity-quote', slug, adults, children] : null,
    () => getActivityQuote(slug, { adults, children }),
    {
      dedupingInterval: 500,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  return { quote: data, error, isLoading, refresh: mutate };
}
