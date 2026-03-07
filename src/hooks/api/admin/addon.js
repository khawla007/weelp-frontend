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

// Activity-type addons for Activity forms
export function useActivityAddOnsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/addons/activity-addons', fetcher);
  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

// Itinerary-type addons for Itinerary forms
export function useItineraryAddOnsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/addons/itinerary-addons', fetcher);
  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

// Package-type addons for Package forms
export function usePackageAddOnsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/addons/package-addons', fetcher);
  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

// Transfer-type addons for Transfer forms
export function useTransferAddOnsAdmin() {
  const { data, error, isValidating, isLoading, mutate } = useSWR('/api/admin/addons/transfer-addons', fetcher);
  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
