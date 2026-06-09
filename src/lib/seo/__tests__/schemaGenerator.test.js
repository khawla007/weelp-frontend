import { generateSchema, getRecommendedSchemaType } from '../schemaGenerator';

describe('schemaGenerator', () => {
  test('recommends item-specific schema types', () => {
    expect(getRecommendedSchemaType('activity')).toBe('Product');
    expect(getRecommendedSchemaType('blog')).toBe('BlogPosting');
    expect(getRecommendedSchemaType('itinerary')).toBe('TouristTrip');
    expect(getRecommendedSchemaType('transfer')).toBe('Service');
  });

  test('generates BlogPosting schema from blog form values', () => {
    const schema = generateSchema({
      itemType: 'blog',
      values: {
        name: 'Dubai food guide',
        excerpt: 'Best places to eat in Dubai.',
        media_gallery: [{ url: '/storage/blog.jpg', is_featured: true }],
        seo: { canonical_url: '/blogs/dubai-food' },
      },
      siteUrl: 'https://weelp.test',
    });

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: 'Dubai food guide',
      description: 'Best places to eat in Dubai.',
      image: ['https://weelp.test/storage/blog.jpg'],
      author: { '@type': 'Organization', name: 'Weelp' },
      publisher: { '@type': 'Organization', name: 'Weelp' },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': 'https://weelp.test/blogs/dubai-food',
      },
    });
  });

  test('generates Product schema for bookable activities', () => {
    const schema = generateSchema({
      itemType: 'activity',
      values: {
        name: 'Desert safari',
        description: '',
        overview: 'A guided desert safari with dune bashing, camel rides, dinner, and live entertainment.',
        whats_included: 'Hotel transfers, dinner, guide, and camp activities are included.',
        media_gallery: [{ url: 'https://cdn.test/safari.jpg', is_featured: true }],
        pricing: { regular_price: 120, currency: 'AED' },
        review_summary: { average_rating: 4.8, total_reviews: 42 },
        reviews: [{ rating: 5, user_name: 'Ava', review_text: 'Excellent desert experience.' }],
        faqs: [{ title: 'Is pickup included?', content: 'Yes, hotel pickup is included.' }],
      },
    });

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@graph']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'Product',
          name: 'Desert safari',
          description: 'A guided desert safari with dune bashing, camel rides, dinner, and live entertainment.',
          image: ['https://cdn.test/safari.jpg'],
          offers: {
            '@type': 'Offer',
            price: '120',
            priceCurrency: 'AED',
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '42',
          },
          review: expect.arrayContaining([
            expect.objectContaining({
              '@type': 'Review',
              reviewRating: { '@type': 'Rating', ratingValue: '5' },
              author: { '@type': 'Person', name: 'Ava' },
              reviewBody: 'Excellent desert experience.',
            }),
          ]),
        }),
        expect.objectContaining({
          '@type': 'FAQPage',
          mainEntity: expect.arrayContaining([
            expect.objectContaining({
              '@type': 'Question',
              name: 'Is pickup included?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes, hotel pickup is included.' },
            }),
          ]),
        }),
      ]),
    );
    expect(schema['@graph'].filter((node) => node?.['@type'] === 'Review')).toHaveLength(0);
  });

  test('generates Service schema for transfers', () => {
    const schema = generateSchema({
      itemType: 'transfer',
      values: {
        name: 'Airport pickup',
        description: 'Private airport pickup.',
        transfer_type: 'airport',
        transfer_price: 80,
        currency: 'USD',
        route: { name: 'DXB to Downtown' },
      },
    });

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Airport pickup',
      description: 'Private airport pickup.',
      serviceType: 'airport',
      provider: { '@type': 'Organization', name: 'Weelp' },
      offers: { '@type': 'Offer', price: '80', priceCurrency: 'USD' },
      areaServed: { '@type': 'Place', name: 'DXB to Downtown' },
    });
  });

  test('generates TouristTrip schema for itineraries', () => {
    const schema = generateSchema({
      itemType: 'itinerary',
      values: {
        name: 'Three days in Dubai',
        description: '',
        inclusions_exclusions: [{ title: 'Guided tours', description: 'Daily guided tours and transfers.', included: true }],
        schedules: [{ title: 'Old Dubai and Creek', activities: [{ name: 'Al Fahidi walking tour', notes: 'Explore heritage lanes.' }] }],
        faqs: [{ question: 'Can this be customized?', answer: 'Yes, itinerary customization is available.' }],
        review_summary: { average_rating: 4.6, total_reviews: 9 },
        reviews: [{ rating: 5, author: 'Noah', review_text: 'Well planned itinerary.' }],
        media_gallery: [{ url: '/itinerary.jpg' }],
        locations: [{ city: 'Dubai' }, { city: 'Abu Dhabi' }],
        pricing: { regular_price: 300, currency: 'USD' },
      },
      siteUrl: 'https://weelp.test',
    });

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@graph']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'TouristTrip',
          name: 'Three days in Dubai',
          description: 'Old Dubai and Creek Al Fahidi walking tour Explore heritage lanes.',
          image: ['https://weelp.test/itinerary.jpg'],
          itinerary: [
            { '@type': 'Place', name: 'Dubai' },
            { '@type': 'Place', name: 'Abu Dhabi' },
          ],
          offers: { '@type': 'Offer', price: '300', priceCurrency: 'USD' },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.6', reviewCount: '9' },
          review: expect.arrayContaining([
            { '@type': 'Review', reviewRating: { '@type': 'Rating', ratingValue: '5' }, author: { '@type': 'Person', name: 'Noah' }, reviewBody: 'Well planned itinerary.' },
          ]),
        }),
        expect.objectContaining({
          '@type': 'FAQPage',
          mainEntity: [{ '@type': 'Question', name: 'Can this be customized?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, itinerary customization is available.' } }],
        }),
      ]),
    );
    expect(schema['@graph'].filter((node) => node?.['@type'] === 'Review')).toHaveLength(0);
  });

  test('omits empty values and returns JSON serializable output', () => {
    const schema = generateSchema({
      itemType: 'activity',
      values: {
        name: 'Only name',
        description: '',
        pricing: { regular_price: null, currency: undefined },
      },
    });

    expect(schema.description).toBeUndefined();
    expect(schema.offers).toBeUndefined();
    expect(JSON.parse(JSON.stringify(schema))).toEqual(schema);
  });
});
