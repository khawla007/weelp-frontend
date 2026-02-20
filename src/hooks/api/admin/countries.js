import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useCountriesOptionsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/destinations/countries/countriesdropdown', fetcher);
  return {
    countries: data || [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
