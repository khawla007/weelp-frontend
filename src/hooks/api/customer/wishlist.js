import useSWR, { useSWRConfig } from 'swr';

import { addWishlistItem, getWishlistItems, removeWishlistItem, removeWishlistItemByIdentity } from '@/lib/services/customer/wishlist';

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
  const params = Array.isArray(key) ? key[1] : {};
  const firstPage = await getWishlistItems({ ...params, page: 1, per_page: 50 });
  const { items: firstPageItems, meta } = unwrapWishlistResponse(firstPage);
  const lastPage = Math.max(Number(meta?.last_page) || 1, 1);

  if (lastPage === 1) return firstPage;

  const remainingPages = await Promise.all(Array.from({ length: lastPage - 1 }, (_, index) => getWishlistItems({ ...params, page: index + 2, per_page: 50 })));
  const allItems = remainingPages.reduce((items, page) => [...items, ...unwrapWishlistResponse(page).items], firstPageItems);

  return replaceWishlistItems(firstPage, allItems);
}

function unwrapWishlistResponse(data) {
  const payload = data?.data ?? data;
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.items) ? payload.items : Array.isArray(data?.items) ? data.items : [];

  const meta = data?.meta ?? payload?.meta ?? payload?.pagination ?? data?.pagination ?? null;

  return { items, meta };
}

function replaceWishlistItems(data, items) {
  if (Array.isArray(data)) return items;
  if (Array.isArray(data?.data)) return { ...data, data: items };
  if (Array.isArray(data?.data?.data)) return { ...data, data: { ...data.data, data: items } };
  if (Array.isArray(data?.data?.items)) return { ...data, data: { ...data.data, items } };
  if (Array.isArray(data?.items)) return { ...data, items };

  return { success: true, data: items };
}

function wishlistIdentity(item) {
  if (!item?.item_type || item?.item_id === undefined || item?.item_id === null) return null;
  return `${item.item_type}:${item.item_id}`;
}

function wishlistRowId(item) {
  return String(item?.id ?? '');
}

export function useWishlistItems(options = {}) {
  const { enabled = true, ...wishlistOptions } = options;
  const { params, swrOptions } = splitOptions(wishlistOptions);
  const key = enabled ? wishlistKey(params) : null;
  const { mutate: mutateCache } = useSWRConfig();
  const { data, error, isLoading, isValidating, mutate } = useSWR(key, wishlistFetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    ...swrOptions,
  });

  const { items, meta } = unwrapWishlistResponse(data);

  const addItem = async (payload) => {
    const identity = wishlistIdentity(payload);
    const optimisticId = `optimistic:${identity}`;
    const optimisticItem = { ...payload, id: optimisticId };

    await mutateCache(
      WISHLIST_ITEMS_KEY,
      (current) => {
        const currentItems = unwrapWishlistResponse(current).items;
        if (!identity || currentItems.some((item) => wishlistIdentity(item) === identity)) return current;
        return replaceWishlistItems(current, [optimisticItem, ...currentItems]);
      },
      { revalidate: false },
    );

    try {
      const response = await addWishlistItem(payload);
      const savedItem = response?.data ?? optimisticItem;
      await mutateCache(
        WISHLIST_ITEMS_KEY,
        (current) => {
          const currentItems = unwrapWishlistResponse(current).items;
          return replaceWishlistItems(
            current,
            currentItems.map((item) => (wishlistRowId(item) === optimisticId ? savedItem : item)),
          );
        },
        { revalidate: false },
      );
      return response;
    } catch (addError) {
      await mutateCache(
        WISHLIST_ITEMS_KEY,
        (current) => {
          const currentItems = unwrapWishlistResponse(current).items;
          return replaceWishlistItems(
            current,
            currentItems.filter((item) => wishlistRowId(item) !== optimisticId),
          );
        },
        { revalidate: false },
      );
      throw addError;
    }
  };

  const removeItem = async (wishlistItemId) => {
    let removedItems = [];
    const wishlistId = String(wishlistItemId);

    await mutateCache(
      WISHLIST_ITEMS_KEY,
      (current) => {
        const currentItems = unwrapWishlistResponse(current).items;
        removedItems = currentItems.filter((item) => wishlistRowId(item) === wishlistId);
        return replaceWishlistItems(
          current,
          currentItems.filter((item) => wishlistRowId(item) !== wishlistId),
        );
      },
      { revalidate: false },
    );

    try {
      const response = await removeWishlistItem(wishlistItemId);
      return response;
    } catch (removeError) {
      await mutateCache(
        WISHLIST_ITEMS_KEY,
        (current) => {
          const currentItems = unwrapWishlistResponse(current).items;
          const missingItems = removedItems.filter((removedItem) => !currentItems.some((item) => wishlistRowId(item) === wishlistRowId(removedItem)));
          return replaceWishlistItems(current, [...missingItems, ...currentItems]);
        },
        { revalidate: false },
      );
      throw removeError;
    }
  };

  const removeItemByIdentity = async (itemType, itemId) => {
    const identity = `${itemType}:${itemId}`;
    let removedItems = [];

    await mutateCache(
      WISHLIST_ITEMS_KEY,
      (current) => {
        const currentItems = unwrapWishlistResponse(current).items;
        removedItems = currentItems.filter((item) => wishlistIdentity(item) === identity);
        return replaceWishlistItems(
          current,
          currentItems.filter((item) => wishlistIdentity(item) !== identity),
        );
      },
      { revalidate: false },
    );

    try {
      const response = await removeWishlistItemByIdentity(itemType, itemId);
      return response;
    } catch (removeError) {
      await mutateCache(
        WISHLIST_ITEMS_KEY,
        (current) => {
          const currentItems = unwrapWishlistResponse(current).items;
          const currentIdentities = new Set(currentItems.map(wishlistIdentity));
          const missingItems = removedItems.filter((removedItem) => !currentIdentities.has(wishlistIdentity(removedItem)));
          return replaceWishlistItems(current, [...missingItems, ...currentItems]);
        },
        { revalidate: false },
      );
      throw removeError;
    }
  };

  return {
    items,
    meta,
    isLoading: enabled ? isLoading : false,
    isValidating: enabled ? isValidating : false,
    error,
    mutate,
    addItem,
    removeItem,
    removeItemByIdentity,
  };
}
