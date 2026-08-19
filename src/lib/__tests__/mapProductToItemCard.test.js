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

  const baseAttributeProduct = {
    id: 1,
    name: 'Desert Safari',
    slug: 'desert-safari',
    item_type: 'activity',
    city_slug: 'dubai',
    short_description: 'Ride the dunes at golden hour.',
    attributes: [
      { slug: 'duration', name: 'Duration', attribute_value: '4 Hours' },
      { slug: 'group-size', name: 'Group Size', attribute_value: '6-10' },
      { slug: 'age-restriction', name: 'Age Restriction', attribute_value: '12+' },
      { slug: 'language', name: 'Language', attribute_value: 'English' },
    ],
  };

  test('passes short_description through as shortDescription', () => {
    const card = mapProductToItemCard(baseAttributeProduct);
    expect(card.shortDescription).toBe('Ride the dunes at golden hour.');
  });

  test('caps attributes at the first three from the payload', () => {
    const card = mapProductToItemCard(baseAttributeProduct);
    expect(card.attributes).toHaveLength(3);
    expect(card.attributes.map((attribute) => attribute.slug)).toEqual([
      'duration',
      'group-size',
      'age-restriction',
    ]);
  });

  test('returns null for shortDescription when the payload omits it', () => {
    const card = mapProductToItemCard({ ...baseAttributeProduct, short_description: undefined });
    expect(card.shortDescription).toBeNull();
  });

  test('returns an empty array for attributes when the payload omits them', () => {
    const card = mapProductToItemCard({ ...baseAttributeProduct, attributes: undefined });
    expect(card.attributes).toEqual([]);
  });

  test('returns an empty array for attributes when the payload sends a non-array', () => {
    const card = mapProductToItemCard({ ...baseAttributeProduct, attributes: null });
    expect(card.attributes).toEqual([]);
  });
});
