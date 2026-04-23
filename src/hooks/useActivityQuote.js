'use client';

import useSWR from 'swr';
import { getActivityQuote } from '@/lib/services/activites';

/**
 * Hook to fetch activity quote with SWR
 * @param {string} slug - Activity slug
 * @param {Object} options - Query options
 * @param {number} options.adults - Number of adults
 * @param {number} [options.children=0] - Number of children
 * @param {string|null} [options.startDate=null] - ISO date (YYYY-MM-DD) for EB/LM computation
 * @returns {Object} Quote data, loading/error states, and refresh function
 */
export function useActivityQuote(slug, { adults, children = 0, startDate = null } = {}) {
  const shouldFetch = Boolean(slug) && Number.isFinite(adults) && adults + children > 0;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['activity-quote', slug, adults, children, startDate] : null,
    () => getActivityQuote(slug, { adults, children, startDate }),
    {
      dedupingInterval: 500,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  return { quote: data, error, isLoading, refresh: mutate };
}
