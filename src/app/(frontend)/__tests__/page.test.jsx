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
