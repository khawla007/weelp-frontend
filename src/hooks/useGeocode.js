'use client';

import { useSession } from 'next-auth/react';
import useSWR from 'swr';

import { geocode } from '@/lib/services/gateway';

/**
 * @typedef {import('@/types/gateway').components['schemas']['CanonicalPlace']} CanonicalPlace
 */

const MIN_QUERY_LENGTH = 2;

// Cache key explicitly carries `hasToken` so anonymous and authenticated
// responses never collide. The gateway already caches per-query, but the tier
// flip lives in the request headers and SWR has no way to see them otherwise.
function buildKey(query, limit, hasToken) {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) return null;
  return ['gateway:geocode', query.trim(), limit, hasToken];
}

/**
 * @param {string} query
 * @param {{ limit?: number }} [opts]
 * @returns {{
 *   data: CanonicalPlace[] | undefined,
 *   error: Error | undefined,
 *   isLoading: boolean,
 *   isValidating: boolean,
 *   mutate: () => void,
 * }}
 */
export function useGeocode(query, { limit = 5 } = {}) {
  // useSession returns undefined during static prerender; guard the destructure.
  const { data: session } = useSession() ?? { data: null };
  const token = session?.access_token && !session.error ? session.access_token : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(buildKey(query, limit, !!token), ([, q, lim]) => geocode(q, { limit: lim, token }), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return { data, error, isLoading, isValidating, mutate };
}
