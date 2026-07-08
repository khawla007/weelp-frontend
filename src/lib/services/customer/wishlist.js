import { getAuthApi } from '@/lib/axiosInstance';

const WISHLIST_ENDPOINT = '/api/customer/wishlist';

export async function getWishlistItems(params = {}) {
  const api = await getAuthApi();
  const response = await api.get(WISHLIST_ENDPOINT, {
    params,
    headers: { Accept: 'application/json' },
  });

  return response.data;
}

export async function addWishlistItem(payload) {
  const api = await getAuthApi();
  const response = await api.post(WISHLIST_ENDPOINT, payload, {
    headers: { Accept: 'application/json' },
  });

  return response.data;
}

export async function removeWishlistItem(wishlistItemId) {
  const api = await getAuthApi();
  const response = await api.delete(`${WISHLIST_ENDPOINT}/${wishlistItemId}`, {
    headers: { Accept: 'application/json' },
  });

  return response.data;
}

export async function removeWishlistItemByIdentity(itemType, itemId) {
  const api = await getAuthApi();
  const response = await api.delete(`${WISHLIST_ENDPOINT}/item/${itemType}/${itemId}`, {
    headers: { Accept: 'application/json' },
  });

  return response.data;
}
