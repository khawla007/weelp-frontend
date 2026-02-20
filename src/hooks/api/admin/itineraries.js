import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useAllItinerariesAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/itineraries', fetcher);

  return {
    itineraries: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
