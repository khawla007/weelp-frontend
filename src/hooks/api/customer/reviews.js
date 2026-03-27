import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

export function useAllReviewsCustomer() {
  const { data, error, isValidating, isLoading, mutate } = useSWR(`/api/customer/reviews`, fetcher);

  // Extract the nested data structure
  // Response format: { data: { success: true, reviews: [...] }, status: 200 }
  const reviews = data?.data?.reviews || [];

  return {
    data: { ...data?.data, reviews },
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

export default useAllReviewsCustomer;
