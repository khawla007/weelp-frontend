import useSWR from 'swr';
import { authApi } from '@/lib/axiosInstance';

// Static SWR key base - backend uses singular 'review' not 'reviews'
const REVIEWS_KEY = '/api/customer/review';

// Custom fetcher defined inline to avoid import issues
const reviewsFetcher = async (url) => {
  try {
    // Add timeout to prevent hanging requests
    const res = await Promise.race([authApi.get(url), new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 15000))]);
    return res.data;
  } catch (error) {
    // Return empty result on error to prevent infinite retries
    if (error.response?.status === 401 || error.response?.status === 404) {
      return { success: true, reviews: [], pagination: { total: 0, per_page: 6, current_page: 1, last_page: 1 } };
    }
    // Also return empty result on timeout or other errors
    if (error.message === 'Request timeout' || !error.response) {
      console.error('Reviews fetch error:', error.message);
      return { success: true, reviews: [], pagination: { total: 0, per_page: 6, current_page: 1, last_page: 1 } };
    }
    throw error;
  }
};

export function useAllReviewsCustomer(page = 1) {
  // Build query string with pagination
  const query = `?page=${page}&per_page=6`;
  const key = `${REVIEWS_KEY}${query}`;

  const { data, error, isValidating, isLoading, mutate } = useSWR(key, reviewsFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    dedupingInterval: 10000,
    errorRetryCount: 0,
    refreshInterval: 0,
    keepPreviousData: false, // Don't keep previous data to avoid stale loading state
  });

  // Ensure isLoading is false if we have data or error
  const finalIsLoading = isLoading && !data && !error;

  return {
    data: data || { success: true, reviews: [], pagination: { total: 0, per_page: 6, current_page: 1, last_page: 1 } },
    isLoading: finalIsLoading,
    isValidating,
    error,
    mutate,
  };
}

export default useAllReviewsCustomer;
