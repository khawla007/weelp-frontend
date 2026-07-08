export const WISHLIST_ITEM_TYPES = ['activity', 'itinerary', 'package', 'transfer'];

export const WISHLIST_ROUTE_SEGMENTS = {
  activity: 'activities',
  itinerary: 'itineraries',
  package: 'packages',
  transfer: 'transfers',
};

const TYPE_ALIASES = {
  activities: 'activity',
  itineraries: 'itinerary',
  packages: 'package',
  transfers: 'transfer',
};

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function normalizeType(value) {
  if (typeof value !== 'string') return null;

  const type = value.trim().toLowerCase();
  return WISHLIST_ITEM_TYPES.includes(type) ? type : TYPE_ALIASES[type] || null;
}

function normalizeImage(value) {
  if (!value || typeof value !== 'object') return value;

  return firstValue(value.url, value.src, value.image_url, value.thumbnail);
}

export function normalizeWishlistPayload(item) {
  if (!item || typeof item !== 'object') return null;

  const itemType = normalizeType(firstValue(item.item_type, item.type, item.kind));
  const itemId = firstValue(item.item_id, item.itemId, item.id);

  if (!itemType || itemId === undefined || itemId === null || itemId === '') {
    return null;
  }

  return {
    item_type: itemType,
    item_id: itemId,
    title: firstValue(item.title, item.name) ?? null,
    slug: firstValue(item.slug) ?? null,
    city_slug: firstValue(item.city_slug, item.citySlug) ?? null,
    city_name: firstValue(item.city_name, item.cityName) ?? null,
    image_url: normalizeImage(firstValue(item.image_url, item.image, item.thumbnail)) ?? null,
    price: firstValue(item.price, item.amount) ?? null,
    currency: firstValue(item.currency) ?? null,
    snapshot: item,
  };
}

export function getWishlistItemHref(item) {
  const payload = normalizeWishlistPayload(item);
  if (!payload) return null;

  const segment = WISHLIST_ROUTE_SEGMENTS[payload.item_type];

  if (!payload.city_slug || !segment || !payload.slug) {
    return null;
  }

  return `/cities/${payload.city_slug}/${segment}/${payload.slug}`;
}
