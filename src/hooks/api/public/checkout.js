import useSWR from 'swr';
import axios from 'axios';

// fetcher function for SWR POST REQUEST FOR ONLY AUTOMATE HOSTED CHECKOUT
const fetcher = (session_id) => axios.post('/api/public/checkout/confirmation', { session_id }).then((res) => res.data);

export function useBookingData(session_id) {
  const { data, error, isLoading, mutate } = useSWR(session_id ? ['bookingData', session_id] : null, () => fetcher(session_id), {
    refreshInterval: (latestData) => {
      const status = latestData?.data?.order?.payment?.payment_status?.toLowerCase();
      return status === 'pending' || status === 'processing' ? 3000 : 0;
    },
  });

  return {
    bookingData: data,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}
