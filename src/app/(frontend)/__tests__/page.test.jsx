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

test('uses theme-aware overlay text for homepage destinations', async () => {
  const cities = [{ id: 1, name: 'Paris', slug: 'paris' }];

  getAllFeaturedActivities.mockResolvedValue([]);
  getAllFeaturedCities.mockResolvedValue(cities);
  getPublicReviews.mockResolvedValue({ data: [] });
  publicApi.get.mockResolvedValue({ data: { data: [] } });

  const page = await HomePage();
  const destinationSection = Children.toArray(page.props.children).find((child) => child.props?.cities === cities);

  expect(destinationSection).toBeDefined();
  expect(destinationSection.props.cardTextTone).toBe('theme');
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
});
