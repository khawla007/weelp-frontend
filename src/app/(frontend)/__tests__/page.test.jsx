import { Children } from 'react';

import HomePage from '../page';
import { publicApi } from '@/lib/axiosInstance';
import { getAllFeaturedActivities } from '@/lib/services/activites';
import { getAllFeaturedCities } from '@/lib/services/cities';
import { getPublicReviews } from '@/lib/services/reviews';

jest.mock('@/lib/axiosInstance', () => ({
  publicApi: { get: jest.fn() },
}));

jest.mock('@/lib/services/activites', () => ({
  getAllFeaturedActivities: jest.fn(),
}));

jest.mock('@/lib/services/cities', () => ({
  getAllFeaturedCities: jest.fn(),
}));

jest.mock('@/lib/services/reviews', () => ({
  getPublicReviews: jest.fn(),
}));

test('uses the shared Postcard treatment for homepage destinations', async () => {
  const cities = [{ id: 1, name: 'Paris', slug: 'paris' }];

  getAllFeaturedActivities.mockResolvedValue([]);
  getAllFeaturedCities.mockResolvedValue(cities);
  getPublicReviews.mockResolvedValue({ data: [] });
  publicApi.get.mockResolvedValue({ data: { data: [] } });

  const page = await HomePage();
  const destinationSection = Children.toArray(page.props.children).find((child) => child.props?.cities === cities);

  expect(destinationSection).toBeDefined();
  expect(destinationSection.props).not.toHaveProperty('cardTextTone');
});

test('opts the homepage Top activities carousel into the staggered entrance', async () => {
  const activities = [{ id: 1, item_type: 'activity', name: 'Desert safari', slug: 'desert-safari', city_slug: 'dubai' }];

  getAllFeaturedActivities.mockResolvedValue(activities);
  getAllFeaturedCities.mockResolvedValue([]);
  getPublicReviews.mockResolvedValue({ data: [] });
  publicApi.get.mockResolvedValue({ data: { data: [] } });

  const page = await HomePage();
  const activitiesSection = Children.toArray(page.props.children).find((child) => child.props?.title === 'Top activities');

  expect(activitiesSection).toBeDefined();
  expect(activitiesSection.props.carouselEntrance).toBe('stagger-right');
  expect(activitiesSection.props.items[0]).toMatchObject({
    productId: 1,
    itemType: 'activity',
    slug: 'desert-safari',
    citySlug: 'dubai',
    hasValidIdentity: true,
    wishlistItem: {
      item_type: 'activity',
      item_id: 1,
      title: 'Desert safari',
      slug: 'desert-safari',
      city_slug: 'dubai',
      image_url: '/assets/Card.webp',
      price: null,
      currency: null,
    },
  });
});

test('opts the homepage Top destinations carousel into the staggered entrance', async () => {
  const cities = [{ id: 1, name: 'Paris', slug: 'paris' }];

  getAllFeaturedActivities.mockResolvedValue([]);
  getAllFeaturedCities.mockResolvedValue(cities);
  getPublicReviews.mockResolvedValue({ data: [] });
  publicApi.get.mockResolvedValue({ data: { data: [] } });

  const page = await HomePage();
  const destinationSection = Children.toArray(page.props.children).find((child) => child.props?.cities === cities);

  expect(destinationSection).toBeDefined();
  expect(destinationSection.props.carouselEntrance).toBe('stagger-right');
});

test('matches the homepage Postcards entrance to the shared stagger-right carousels', async () => {
  const reviews = [{ id: 1, review_text: 'Wonderful trip' }];

  getAllFeaturedActivities.mockResolvedValue([]);
  getAllFeaturedCities.mockResolvedValue([]);
  getPublicReviews.mockResolvedValue({ data: reviews });
  publicApi.get.mockResolvedValue({ data: { data: [] } });

  const page = await HomePage();
  const testimonialSection = Children.toArray(page.props.children).find((child) => child.props?.reviews === reviews);

  expect(testimonialSection).toBeDefined();
  expect(testimonialSection.props.entrance).toBe('stagger-right');
});
