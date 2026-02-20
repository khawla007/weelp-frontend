// hooks/useUserProfile.js
import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export const useUserProfile = () => {
  const { data, error, isLoading } = useSWR('/api/customer/profile', fetcher);

  return {
    user: data?.user || {},
    error: data?.error || error,
    isLoading,
  };
};
