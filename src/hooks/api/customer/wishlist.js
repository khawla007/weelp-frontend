import useSWR from 'swr';

import {
  addWishlistItem,
  getWishlistItems,
  removeWishlistItem,
  removeWishlistItemByIdentity,
} from '@/lib/services/customer/wishlist';

export const WISHLIST_ITEMS_KEY = '/api/customer/wishlist';

const SWR_OPTION_KEYS = new Set([
  'dedupingInterval',
  'errorRetryCount',
  'fallbackData',
  'focusThrottleInterval',
  'isPaused',
  'keepPreviousData',
  'loadingTimeout',
  'onDiscarded',
  'onError',
  'onErrorRetry',
  'onLoadingSlow',
  'onSuccess',
  'refreshInterval',
  'refreshWhenHidden',
  'refreshWhenOffline',
  'revalidateIfStale',
  'revalidateOnFocus',
  'revalidateOnMount',
  'revalidateOnReconnect',
  'shouldRetryOnError',
  'suspense',
  'use',
]);

function splitOptions(options) {
  const params = options.params ? { ...options.params } : {};
  const swrOptions = {};

  Object.entries(options).forEach(([key, value]) => {
    if (key === 'params') return;

    if (SWR_OPTION_KEYS.has(key)) {
      swrOptions[key] = value;
      return;
    }

    if (!options.params) {
      params[key] = value;
    }
  });

  return { params, swrOptions };
}

function wishlistKey(params) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');

  return entries.length ? [WISHLIST_ITEMS_KEY, Object.fromEntries(entries)] : WISHLIST_ITEMS_KEY;
}

async function wishlistFetcher(key) {
  if (Array.isArray(key)) {
    return getWishlistItems(key[1]);
  }

  return getWishlistItems();
}

function unwrapWishlistResponse(data) {
  const payload = data?.data ?? data;
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(data?.items)
          ? data.items
          : [];

  const meta = data?.meta ?? payload?.meta ?? payload?.pagination ?? data?.pagination ?? null;

  return { items, meta };
}

export function useWishlistItems(options = {}) {
  const { params, swrOptions } = splitOptions(options);
  const { data, error, isLoading, isValidating, mutate } = useSWR(wishlistKey(params), wishlistFetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    ...swrOptions,
  });

  const { items, meta } = unwrapWishlistResponse(data);

  const addItem = async (payload) => {
    const response = await addWishlistItem(payload);
    await mutate();
    return response;
  };

  const removeItem = async (wishlistItemId) => {
    const response = await removeWishlistItem(wishlistItemId);
    await mutate();
    return response;
  };

  const removeItemByIdentity = async (itemType, itemId) => {
    const response = await removeWishlistItemByIdentity(itemType, itemId);
    await mutate();
    return response;
  };

  return {
    items,
    meta,
    isLoading,
    isValidating,
    error,
    mutate,
    addItem,
    removeItem,
    removeItemByIdentity,
  };
}
