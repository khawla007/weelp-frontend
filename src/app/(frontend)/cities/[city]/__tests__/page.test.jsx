import { Children } from 'react';

import CityPage from '../page';
import { getAllFeaturedActivities } from '@/lib/services/activites';
import { getAllBlogs } from '@/lib/services/blogs';
import { getCityData } from '@/lib/services/cities';
import { getFeaturedItineraries } from '@/lib/services/itineraries';
import { getFeaturedReviews } from '@/lib/services/reviews';

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader) => {
    const source = loader.toString();
    const sectionName = ['ReviewSectionCity', 'ProductSliderSection', 'SharedFilterSection', 'BlogSection'].find((name) => source.includes(name));
    const DynamicSection = () => null;
    DynamicSection.sectionName = sectionName;
    return DynamicSection;
  },
}));

jest.mock('next/navigation', () => ({ notFound: jest.fn() }));
jest.mock('@/app/components/Pages/FRONT_END/city/CityHeroBanner', () => () => null);
jest.mock('@/app/components/Pages/FRONT_END/Global/CitySection', () => () => null);
jest.mock('@/app/components/Pages/FRONT_END/shared/SharedToursSection', () => () => null);
jest.mock('@/lib/services/activites', () => ({ getAllFeaturedActivities: jest.fn() }));
jest.mock('@/lib/services/blogs', () => ({ getAllBlogs: jest.fn() }));
jest.mock('@/lib/services/cities', () => ({ getCityData: jest.fn() }));
jest.mock('@/lib/services/itineraries', () => ({ getFeaturedItineraries: jest.fn() }));
jest.mock('@/lib/services/reviews', () => ({ getFeaturedReviews: jest.fn() }));

test('leaves city blog entrance ownership to the shared BlogSection', async () => {
  const blogs = [{ id: 1, title: 'Paris guide' }];
  getCityData.mockResolvedValue({ data: { name: 'Paris' } });
  getAllFeaturedActivities.mockResolvedValue({ data: [] });
  getFeaturedItineraries.mockResolvedValue({ data: [] });
  getAllBlogs.mockResolvedValue({ data: blogs });
  getFeaturedReviews.mockResolvedValue({ data: [] });

  const page = await CityPage({ params: Promise.resolve({ city: 'paris' }) });
  const children = Children.toArray(page.props.children);
  const cityBlogs = children.find((child) => child.type?.sectionName === 'BlogSection');

  expect(cityBlogs).toBeDefined();
  expect(cityBlogs.props).toEqual(expect.objectContaining({ blogs, title: 'Blogs', navigationId: 'city-blogs' }));
  expect(cityBlogs.props).not.toHaveProperty('entrance');
});
