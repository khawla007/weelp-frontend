import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

// fetcher function for SWR GET REQUEST FOR ONLY AUTOMATE MANUAL CHECKOUT
export function useOrderThankyou(payment_intent) {
  const url = payment_intent ? `/api/public/checkout/thankyou?payment_intent=${payment_intent}` : null;

  const { data = {}, error, isLoading, isValidating } = useSWR(url, fetcher);
  return {
    orderData: data,
    isValidating,
    isLoading,
    error,
  };
}
