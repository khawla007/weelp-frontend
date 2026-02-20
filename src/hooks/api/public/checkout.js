import useSWR from 'swr';
import axios from 'axios';
import { log } from '@/lib/utils';

// fetcher function for SWR POST REQUEST FOR ONLY AUTOMATE HOSTED CHECKOUT
const fetcher = (session_id) => axios.post('/api/public/checkout/confirmation', { session_id }).then((res) => res.data);

export function useBookingData(session_id) {
  const { data, error, isLoading } = useSWR(session_id ? ['bookingData', session_id] : null, () => fetcher(session_id));

  return {
    bookingData: data,
    loading: isLoading,
    error,
  };
}
