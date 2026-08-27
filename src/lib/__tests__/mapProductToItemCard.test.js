import { mapBlogToItemCard, mapCreatorItineraryToItemCard, mapProductToItemCard } from '@/lib/mapProductToItemCard';

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

  test('preserves an explicit zero-review state for card display', () => {
    const card = mapProductToItemCard({
      id: 3,
      name: 'New Activity',
      slug: 'new-activity',
      item_type: 'activity',
      city_slug: 'rome',
      average_rating: 0,
      reviews_count: 0,
    });

    expect(card.rating).toBe('0');
    expect(card.ratingValue).toBe(0);
    expect(card.reviewCount).toBe('0');
    expect(card.reviewCountValue).toBe(0);
  });

  test('does not invent review data when aggregate fields are missing', () => {
    const card = mapProductToItemCard({
      id: 30,
      name: 'Unmeasured Activity',
      slug: 'unmeasured-activity',
      item_type: 'activity',
      city_slug: 'rome',
    });

    expect(card.rating).toBeNull();
    expect(card.ratingValue).toBeNull();
    expect(card.reviewCount).toBeNull();
    expect(card.reviewCountValue).toBeNull();
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
    expect(card.attributes.map((attribute) => attribute.slug)).toEqual(['duration', 'group-size', 'age-restriction']);
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

  test('degrades malformed media collections to the generic image', () => {
    const card = mapProductToItemCard({ ...baseAttributeProduct, media_gallery: {} });

    expect(card.image).toBe('/assets/Card.webp');
    expect(card.hasRealImage).toBe(false);
  });

  test('keeps display values separate from raw schema values', () => {
    const card = mapProductToItemCard({
      id: 4,
      name: 'Family Package',
      slug: 'family-package',
      item_type: 'package',
      city_slug: 'dubai',
      listing_price: '100.50',
      discount_percentage: 25,
      average_rating: '4.666',
      reviews_count: 1200,
      base_pricing: { currency: 'AED' },
      stock_status: 'in_stock',
    });

    expect(card).toMatchObject({
      priceValue: 100.5,
      priceCurrency: 'AED',
      rating: '4.7',
      ratingValue: 4.666,
      reviewCount: '1.2K',
      reviewCountValue: 1200,
      availability: 'https://schema.org/InStock',
    });
    expect(card.price).toContain('AED');
    expect(card.price).toContain('100.50');
    expect(card.originalPrice).toContain('AED');
    expect(card.originalPrice).toContain('134.00');
  });

  test('maps a valid identity, first API category, city-aware URL, and minimal wishlist payload', () => {
    const card = mapProductToItemCard({
      id: 9,
      name: 'Dune Ride',
      slug: 'dune-ride',
      item_type: 'activity',
      city_slug: 'dubai',
      categories: [{ name: 'Outdoor adventure' }],
    });

    expect(card.category).toBe('Outdoor adventure');
    expect(card).toMatchObject({
      productId: 9,
      itemType: 'activity',
      slug: 'dune-ride',
      citySlug: 'dubai',
      hasValidIdentity: true,
      hasRealTitle: true,
      href: '/cities/dubai/activities/dune-ride',
      hasRealImage: false,
      wishlistItem: {
        item_type: 'activity',
        item_id: 9,
        title: 'Dune Ride',
        slug: 'dune-ride',
        city_slug: 'dubai',
        image_url: '/assets/Card.webp',
        price: null,
        currency: null,
      },
    });
  });

  test('uses the explicit city argument in the URL and wishlist payload', () => {
    const card = mapProductToItemCard({ id: 11, name: 'Paris Walk', slug: 'paris-walk', item_type: 'activity' }, 'paris');

    expect(card.href).toBe('/cities/paris/activities/paris-walk');
    expect(card.citySlug).toBe('paris');
    expect(card.wishlistItem.city_slug).toBe('paris');
  });

  test('does not create a flat URL or wishlist payload when routing identity is incomplete', () => {
    const card = mapProductToItemCard({ id: 12, name: 'Unplaced Activity', slug: 'unplaced', item_type: 'activity' });

    expect(card.href).toBeNull();
    expect(card.hasValidIdentity).toBe(false);
    expect(card.wishlistItem).toBeNull();
  });

  test('does not treat the generic fallback image as schema-eligible product media', () => {
    const card = mapProductToItemCard({ id: 13, name: 'Fallback Image', slug: 'fallback-image', item_type: 'activity', city_slug: 'dubai' });
    expect(card.image).toBe('/assets/Card.webp');
    expect(card.hasRealImage).toBe(false);
  });

  test('marks a blank API name as a display fallback, not a real schema title', () => {
    const card = mapProductToItemCard({ id: 18, name: '   ', slug: 'unnamed-activity', item_type: 'activity', city_slug: 'dubai' });

    expect(card.title).toBe('Untitled');
    expect(card.hasRealTitle).toBe(false);
    expect(card.wishlistItem.title).toBeNull();
  });

  test('does not invent pricing, discounts, availability, or schema values', () => {
    const card = mapProductToItemCard({ id: 10, name: 'Ask the concierge', slug: 'ask-the-concierge', item_type: 'activity', city_slug: 'dubai' });

    expect(card).toMatchObject({
      price: '',
      priceValue: null,
      priceCurrency: null,
      originalPrice: null,
      discount: null,
      ratingValue: null,
      reviewCountValue: null,
      availability: null,
    });
  });

  test.each([
    { listing_price: 100, base_pricing: { currency: 'US' } },
    { listing_price: 100, base_pricing: { currency: 'US1' } },
    { listing_price: 100, base_pricing: { currency: 'ZZZ' } },
    { listing_price: 'not-a-number', base_pricing: { currency: 'USD' } },
  ])('omits display and Offer data for malformed price/currency input %#', (pricing) => {
    const card = mapProductToItemCard({ id: 14, name: 'Malformed Price', slug: 'malformed-price', item_type: 'activity', city_slug: 'dubai', ...pricing });

    expect(card.price).toBe('');
    expect(card.priceCurrency).toBeNull();
  });

  test('normalizes a lowercase padded ISO currency safely', () => {
    const card = mapProductToItemCard({
      id: 17,
      name: 'Normalized Currency',
      slug: 'normalized-currency',
      item_type: 'activity',
      city_slug: 'dubai',
      listing_price: 100,
      base_pricing: { currency: ' usd ' },
    });

    expect(card.priceCurrency).toBe('USD');
    expect(card.price).toBe('$100.00');
  });

  test('accepts a genuine zero price with a valid currency', () => {
    const card = mapProductToItemCard({
      id: 15,
      name: 'Free Museum Day',
      slug: 'free-museum-day',
      item_type: 'activity',
      city_slug: 'paris',
      listing_price: 0,
      base_pricing: { currency: 'EUR' },
    });

    expect(card.priceValue).toBe(0);
    expect(card.priceCurrency).toBe('EUR');
    expect(card.price).toContain('0.00');
  });

  test('maps transfer route pricing to display and raw Offer values', () => {
    const card = mapProductToItemCard({
      id: 19,
      name: 'Airport Pickup',
      slug: 'airport-pickup',
      item_type: 'transfer',
      city_slug: 'dubai',
      route_price: '75.25',
      route_currency: 'AED',
    });

    expect(card).toMatchObject({
      href: '/cities/dubai/transfers/airport-pickup',
      priceValue: 75.25,
      priceCurrency: 'AED',
    });
    expect(card.price).toContain('75.25');
  });

  test.each([
    { route_price: 'not-a-number', route_currency: 'AED' },
    { route_price: 75.25, route_currency: 'ZZZ' },
  ])('omits malformed transfer route pricing %#', (pricing) => {
    const card = mapProductToItemCard({
      id: 20,
      name: 'Invalid Transfer',
      slug: 'invalid-transfer',
      item_type: 'transfer',
      city_slug: 'dubai',
      ...pricing,
    });

    expect(card).toMatchObject({
      price: '',
      priceValue: pricing.route_price === 75.25 ? 75.25 : null,
      priceCurrency: null,
    });
  });

  test('rejects impossible rating, review, discount, availability, and malformed attributes', () => {
    const card = mapProductToItemCard({
      id: 16,
      name: 'Boundary Product',
      slug: 'boundary-product',
      item_type: 'activity',
      city_slug: 'dubai',
      average_rating: 7,
      reviews_count: 2.5,
      discount_percentage: 100,
      availability: 'https://schema.org/Discontinued',
      attributes: [null, { slug: 'duration', name: 'Duration', attribute_value: '2 Hours' }, { name: '', attribute_value: '' }],
    });

    expect(card).toMatchObject({
      rating: null,
      ratingValue: null,
      reviewCount: null,
      reviewCountValue: null,
      discount: null,
      originalPrice: null,
      availability: null,
      attributes: [{ slug: 'duration', name: 'Duration', attribute_value: '2 Hours' }],
    });
  });
});

describe('mapBlogToItemCard', () => {
  test('maps editorial card fields from the first valid category and valid tags', () => {
    expect(
      mapBlogToItemCard({
        id: 14,
        name: 'Wildfire Safety',
        slug: 'wildfire-safety',
        excerpt: 'How to stay safe during fire season.',
        published_at: '2026-08-04T06:58:08.000000Z',
        categories: [{ category_name: '  ' }, { name: 'Nature' }],
        tags: [{ tag_name: 'Safety' }, { name: 'Outdoors' }, 'Seasonal', { tag_name: 'Wildlife' }, { name: 'Planning' }, { tag_name: '  ' }],
        media_gallery: [{ is_featured: true, url: '/wildfire.jpg' }],
      }),
    ).toEqual({
      id: 14,
      href: '/blogs/wildfire-safety',
      image: '/wildfire.jpg',
      title: 'Wildfire Safety',
      category: 'Nature',
      shortDescription: 'How to stay safe during fire season.',
      tags: ['Safety', 'Outdoors', 'Seasonal'],
      additionalTagCount: 2,
    });
  });

  test('ignores malformed bare-string category entries before using the legacy category fallback', () => {
    expect(
      mapBlogToItemCard({
        categories: ['Wrong', { category_name: '  ' }],
        category: { name: 'Legacy' },
      }),
    ).toEqual(expect.objectContaining({ category: 'Legacy' }));
  });

  test('uses Untitled instead of excerpt when the blog name is blank', () => {
    expect(mapBlogToItemCard({ name: '  ', excerpt: '  ', tags: [{ tag_name: '  ' }, null] })).toEqual(
      expect.objectContaining({
        href: null,
        title: 'Untitled',
        category: null,
        shortDescription: null,
        tags: [],
        additionalTagCount: 0,
      }),
    );
  });
});

describe('mapCreatorItineraryToItemCard', () => {
  test('maps creator itineraries into the canonical product contract', () => {
    const card = mapCreatorItineraryToItemCard({
      id: 8,
      name: 'Creator Dubai route',
      slug: 'creator-dubai-route',
      display_price: '240',
      display_currency: 'AED',
      views_count: 21,
      likes_count: 4,
      creator: { name: 'Nora Field Notes' },
      locations: [{ city: { slug: 'dubai' } }],
    });

    expect(card).toMatchObject({
      itemType: 'itinerary',
      href: '/cities/dubai/itineraries/creator-dubai-route',
      title: 'Creator Dubai route',
      category: 'Itinerary',
      shortDescription: 'By Nora Field Notes',
      priceValue: 240,
      priceCurrency: 'AED',
      attributes: [
        { slug: 'views', name: 'Views', attribute_value: '21' },
        { slug: 'likes', name: 'Likes', attribute_value: '4' },
      ],
    });
  });

  test.each([
    [{}, []],
    [{ views_count: null, likes_count: 'bad' }, []],
    [
      { views_count: 0, likes_count: 0 },
      [
        { slug: 'views', name: 'Views', attribute_value: '0' },
        { slug: 'likes', name: 'Likes', attribute_value: '0' },
      ],
    ],
    [{ views_count: 2.5, likes_count: -1 }, []],
  ])('only maps creator engagement counts supplied as valid non-negative integers', (counts, expected) => {
    const card = mapCreatorItineraryToItemCard({
      id: 9,
      name: 'Creator route',
      slug: 'creator-route',
      locations: [{ city: { slug: 'dubai' } }],
      ...counts,
    });

    expect(card.attributes).toEqual(expected);
  });
});
