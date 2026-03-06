import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useAddOnOptionsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/addons/addondropdown', fetcher);
  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

/**
 * Get AddOn Options filtered by type='activity' for Activity forms
 * @returns {SWRResponse} SWR response with activity-type addons
 */
export function useActivityAddOnsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR(
    '/api/admin/addons/addondropdown?type=activity',
    fetcher
  );
  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
