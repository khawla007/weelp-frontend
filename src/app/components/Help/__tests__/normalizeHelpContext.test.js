jest.mock('../../Pages/FRONT_END/singleproduct/SingleProductReview', () => ({
  SingleProductReview: () => null,
}));

import { HELP_TOPICS } from '../helpTopics';
import { normalizeHelpContext } from '../normalizeHelpContext';
import { supportRequestSchema } from '@/lib/validation/supportRequestSchema';

describe('HELP_TOPICS', () => {
  it('provides the immutable support topic contract in display order', () => {
    expect(HELP_TOPICS).toEqual([
      { value: 'dates_availability', label: 'Dates & availability' },
      { value: 'pickup_location', label: 'Pickup & location' },
      { value: 'changes_cancellation', label: 'Changes & cancellation' },
      { value: 'before_booking', label: 'Before you book' },
      { value: 'other', label: 'Something else' },
    ]);
    expect(Object.isFrozen(HELP_TOPICS)).toBe(true);
    expect(HELP_TOPICS.every(Object.isFrozen)).toBe(true);
  });
});

describe('normalizeHelpContext', () => {
  it.each([
    ['activity', 'activities', 161, 'Dubai Desert Safari With BBQ', 'dubai-desert-safari-with-bbq'],
    ['package', 'packages', 42, 'Romantic Paris Tour', 'romantic-paris-tour'],
    ['itinerary', 'itineraries', 87, 'Luxury Safari in Kenya', 'luxury-safari-in-kenya'],
  ])('normalizes a %s into its canonical item route', (productType, routeSegment, productId, name, slug) => {
    const faqs = [
      { id: 1, question: 'What should I bring?', answer: 'Water.' },
      { id: 2, title: 'Can I change the date?', content: 'Yes, subject to availability.' },
      { id: 3, question: '', answer: '' },
    ];

    expect(
      normalizeHelpContext({
        productType: ` ${productType} `,
        productId,
        productData: {
          name: ` ${name} `,
          slug: ` ${slug} `,
          faqs,
        },
        citySlug: ' dubai ',
      }),
    ).toEqual({
      itemType: productType,
      itemId: productId,
      itemTitle: name,
      itemSlug: slug,
      citySlug: 'dubai',
      pagePath: `/cities/dubai/${routeSegment}/${slug}`,
      faqs: [
        { id: 1, question: 'What should I bring?', answer: 'Water.' },
        { id: 2, question: 'Can I change the date?', answer: 'Yes, subject to availability.' },
      ],
    });
  });

  it.each([
    [{ productType: 'transfer', productId: 1, productData: { name: 'Transfer', slug: 'transfer' }, citySlug: 'dubai' }],
    [{ productType: 'activity', productId: 0, productData: { name: 'Tour', slug: 'tour' }, citySlug: 'dubai' }],
    [{ productType: 'activity', productId: -1, productData: { name: 'Tour', slug: 'tour' }, citySlug: 'dubai' }],
    [{ productType: 'activity', productId: 1.5, productData: { name: 'Tour', slug: 'tour' }, citySlug: 'dubai' }],
    [{ productType: 'activity', productId: 1, productData: { slug: 'tour' }, citySlug: 'dubai' }],
    [{ productType: 'activity', productId: 1, productData: { name: 'Tour' }, citySlug: 'dubai' }],
    [{ productType: 'activity', productId: 1, productData: { name: 'Tour', slug: 'tour' } }],
  ])('returns null when a required identity field is missing or invalid', (input) => {
    expect(normalizeHelpContext(input)).toBeNull();
  });
});

describe('supportRequestSchema', () => {
  const validRequest = {
    name: 'Test Guest',
    email: 'guest@example.com',
    topic: 'before_booking',
    message: 'Please tell me whether this trip is suitable for children.',
    website: '',
  };

  it('trims valid support request fields', () => {
    expect(
      supportRequestSchema.parse({
        ...validRequest,
        name: '  Test Guest  ',
        email: '  guest@example.com  ',
        message: '  Please tell me whether this trip is suitable for children.  ',
      }),
    ).toEqual(validRequest);
  });

  it.each(['"john..doe"@example.org', 'traveler@localhost', 'traveler@[127.0.0.1]'])('does not block an RFC-shaped backend-valid email: %s', (email) => {
    const result = supportRequestSchema.safeParse({ ...validRequest, email });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe(email);
  });

  it.each(['not-an-email', 'missing-at.example.com', '@example.com', 'traveler@', 'two@@example.com'])('rejects an obviously invalid email: %s', (email) => {
    const result = supportRequestSchema.safeParse({ ...validRequest, email });

    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.email).toContain('Enter a valid email address');
  });

  it.each([
    ['name', 'x', 'Enter your name'],
    ['topic', 'not_a_topic', undefined],
    ['message', 'Too short', 'Tell us a little more'],
    ['website', 'bot', undefined],
  ])('rejects an invalid %s', (field, value, expectedMessage) => {
    const result = supportRequestSchema.safeParse({ ...validRequest, [field]: value });

    expect(result.success).toBe(false);
    if (expectedMessage) {
      expect(result.error.flatten().fieldErrors[field]).toContain(expectedMessage);
    }
  });
});
