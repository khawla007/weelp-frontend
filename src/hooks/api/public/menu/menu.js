import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

// fetcher function for SWR GET REQUEST FOR ONLY AUTOMATE MANUAL CHECKOUT
export function useNavigationMenu() {
  const {
    data = {},
    error,
    isLoading,
    isValidating,
  } = useSWR('/api/public/menu', fetcher, {
    revalidateOnFocus: false, // don't refetch when tab regains focus
    dedupingInterval: 60000, // dedupe requests within 60s
  });
  return {
    data,
    error,
    isLoading,
    isValidating,
  };
}
