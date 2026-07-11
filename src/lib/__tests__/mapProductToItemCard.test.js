import { mapProductToItemCard } from '@/lib/mapProductToItemCard';

describe('mapProductToItemCard', () => {
  test('maps flat review aggregate fields to card props', () => {
    const card = mapProductToItemCard({
      id: 1,
      name: 'Desert Safari',
      slug: 'desert-safari',
      item_type: 'activity',
      city_slug: 'dubai',
      average_rating: '4.666',
      reviews_count: 1200,
    });

    expect(card.href).toBe('/cities/dubai/activities/desert-safari');
    expect(card.rating).toBe('4.7');
    expect(card.reviewCount).toBe('1.2K');
  });

  test('maps review_summary fields to card props', () => {
    const card = mapProductToItemCard({
      id: 2,
      name: 'Paris Weekend',
      slug: 'paris-weekend',
      item_type: 'itinerary',
      city_slug: 'paris',
      review_summary: {
        average_rating: 5,
        total_reviews: 18,
      },
    });

    expect(card.href).toBe('/cities/paris/itineraries/paris-weekend');
    expect(card.rating).toBe('5');
    expect(card.reviewCount).toBe('18');
  });

  test('does not emit placeholder rating data when reviews are absent', () => {
    const card = mapProductToItemCard({
      id: 3,
      name: 'New Activity',
      slug: 'new-activity',
      item_type: 'activity',
      city_slug: 'rome',
      average_rating: 0,
      reviews_count: 0,
    });

    expect(card.rating).toBeNull();
    expect(card.reviewCount).toBeNull();
  });

  test('uses the API listing price instead of variation order', () => {
    const card = mapProductToItemCard({
      id: 4,
      name: 'Family Package',
      slug: 'family-package',
      item_type: 'package',
      city_slug: 'dubai',
      listing_price: 100,
      base_pricing: {
        currency: 'USD',
        variations: [{ regular_price: 500 }, { regular_price: 100 }],
      },
    });

    expect(card.price).toBe('$100.00');
  });
});
