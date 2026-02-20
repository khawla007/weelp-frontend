import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

/**
 * Function to Retruns Region data
 * @returns
 */
export function useRegions() {
  const { data, isLoading, error } = useSWR('/api/public/region', fetcher); // fetch region through ap
  return {
    data,
    isLoading,
    error,
  };
}
