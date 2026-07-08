import { getWishlistItemHref, normalizeWishlistPayload } from '../normalizeWishlistItem';

describe('normalizeWishlistItem', () => {
  test('normalizes an activity cart-like object to the backend payload', () => {
    const item = {
      id: 42,
      type: 'activity',
      title: 'Desert Safari',
      slug: 'desert-safari',
      citySlug: 'dubai',
      cityName: 'Dubai',
      image: '/images/desert.jpg',
      price: '120.50',
      currency: 'AED',
    };

    expect(normalizeWishlistPayload(item)).toEqual({
      item_type: 'activity',
      item_id: 42,
      title: 'Desert Safari',
      slug: 'desert-safari',
      city_slug: 'dubai',
      city_name: 'Dubai',
      image_url: '/images/desert.jpg',
      price: '120.50',
      currency: 'AED',
      snapshot: item,
    });
  });

  test.each([
    ['itinerary', 'itineraries'],
    ['package', 'packages'],
    ['transfer', 'transfers'],
  ])('%s href uses the %s route segment', (type, segment) => {
    expect(
      getWishlistItemHref({
        item_type: type,
        item_id: 7,
        slug: `${type}-slug`,
        city_slug: 'paris',
      }),
    ).toBe(`/cities/paris/${segment}/${type}-slug`);
  });

  test('returns null when identity is missing or unsupported', () => {
    expect(normalizeWishlistPayload({ id: 1, type: 'hotel' })).toBeNull();
    expect(normalizeWishlistPayload({ type: 'activity' })).toBeNull();
    expect(getWishlistItemHref({ item_type: 'hotel', item_id: 1, city_slug: 'rome', slug: 'stay' })).toBeNull();
  });

  test('builds href for snake_case backend item shape', () => {
    expect(
      getWishlistItemHref({
        item_type: 'activity',
        item_id: 19,
        city_slug: 'marseille',
        slug: 'old-port-walk',
      }),
    ).toBe('/cities/marseille/activities/old-port-walk');
  });
});
