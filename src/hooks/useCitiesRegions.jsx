'use client';
import useSWR from 'swr';
import { getCitiesRegions } from '@/lib/services/global';

const EMPTY = [];

const fetchCitiesRegions = async () => {
  const response = await getCitiesRegions();
  return Array.isArray(response) ? response : (response?.data ?? EMPTY);
};

/**
 * Fetch the shared cities/regions list. SWR dedupes across consumers so
 * Search forms share one in-flight request and cache.
 * @returns {{ data: Array, loading: boolean }}
 */
export function useCitiesRegions() {
  const { data, isLoading } = useSWR('cities-regions', fetchCitiesRegions, {
    revalidateOnFocus: false,
  });

  return { data: data ?? EMPTY, loading: isLoading };
}
