'use client';

import { useSession } from 'next-auth/react';
import useSWR from 'swr';

import { geocode } from '@/lib/services/gateway';

const MIN_QUERY_LENGTH = 2;

// Cache key explicitly carries `hasToken` so anonymous and authenticated
// responses never collide. The gateway already caches per-query, but the tier
// flip lives in the request headers and SWR has no way to see them otherwise.
function buildKey(query, limit, hasToken) {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) return null;
  return ['gateway:geocode', query.trim(), limit, hasToken];
}

export function useGeocode(query, { limit = 5 } = {}) {
  const { data: session } = useSession();
  const token = session?.access_token && !session.error ? session.access_token : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(buildKey(query, limit, !!token), ([, q, lim]) => geocode(q, { limit: lim, token }), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return { data, error, isLoading, isValidating, mutate };
}
