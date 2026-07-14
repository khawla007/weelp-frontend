import useSWR from 'swr';
import axios from 'axios';

export const resultFetcher = (url) => axios.get(url).then((response) => response.data);

// fetcher function for SWR GET REQUEST FOR ONLY AUTOMATE MANUAL CHECKOUT
export function useOrderThankyou(payment_intent) {
  const url = payment_intent ? `/api/public/checkout/thankyou?payment_intent=${payment_intent}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(url, resultFetcher, {
    refreshInterval: (latestData) => {
      const status = latestData?.order?.payment?.payment_status?.toLowerCase();
      return status === 'pending' || status === 'processing' ? 3000 : 0;
    },
  });
  return {
    orderData: data,
    isValidating,
    isLoading,
    error,
    refresh: mutate,
  };
}
