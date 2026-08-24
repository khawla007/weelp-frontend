import { Children } from 'react';

import HomePage, { revalidate as homeRevalidate } from '../../page';
import GoldHomePage, { revalidate as goldRevalidate } from '../page';
import GoldTopActivitiesSection from '../GoldTopActivitiesSection';
import { publicApi } from '@/lib/axiosInstance';
import { getAllFeaturedActivities } from '@/lib/services/activites';
import { getAllFeaturedCities } from '@/lib/services/cities';
import { getPublicReviews } from '@/lib/services/reviews';

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader) => {
    const source = loader.toString();
    const sectionName = ['BrowseDestinationsSection', 'TestimonialSection', 'WanderersBanner', 'AiSection', 'BlogSection'].find((name) => source.includes(name));
    const DynamicSection = () => null;
    DynamicSection.sectionName = sectionName;
    return DynamicSection;
  },
}));

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

jest.mock('../GoldTopActivitiesSection', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

const getGoldChildren = async () => Children.toArray((await GoldHomePage()).props.children);
const getHomeChildren = async () => Children.toArray((await HomePage()).props.children);

describe('/home-gold', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAllFeaturedActivities.mockResolvedValue([]);
    getAllFeaturedCities.mockResolvedValue([]);
    getPublicReviews.mockResolvedValue({ data: [] });
    publicApi.get.mockResolvedValue({ data: { data: [] } });
  });

  it('uses an independent page composition with the canonical cache interval', () => {
    expect(GoldHomePage).not.toBe(HomePage);
    expect(goldRevalidate).toBe(60);
    expect(goldRevalidate).toBe(homeRevalidate);
  });

  it('renders featured activities through the route-local gold section', async () => {
    const activities = [{ id: 1, title: 'Desert safari' }];
    getAllFeaturedActivities.mockResolvedValue(activities);

    const children = await getGoldChildren();

    expect(children[1].type).toBe(GoldTopActivitiesSection);
    expect(children[1].props.activities).toBe(activities);
  });

  it('preserves non-target section order and key props', async () => {
    const activities = [{ id: 1, title: 'Desert safari' }];
    const cities = [{ id: 2, name: 'Paris', slug: 'paris' }];
    const blogs = [{ id: 3, title: 'A local guide' }];
    const reviews = [{ id: 4, comment: 'Wonderful' }];
    getAllFeaturedActivities.mockResolvedValue(activities);
    getAllFeaturedCities.mockResolvedValue(cities);
    getPublicReviews.mockResolvedValue({ data: reviews });
    publicApi.get.mockResolvedValue({ data: { data: blogs } });

    const children = await getGoldChildren();

    expect(children).toHaveLength(8);
    expect(children[1].type).toBe(GoldTopActivitiesSection);
    expect(children.slice(2, 7).map((child) => child.type.sectionName)).toEqual(['BrowseDestinationsSection', 'TestimonialSection', 'WanderersBanner', 'AiSection', 'BlogSection']);
    expect(children[2].props).toMatchObject({
      cities,
      cardTextTone: 'theme',
      className: 'pb-12 md:pb-16 lg:pb-24',
    });
    expect(children[3].props.reviews).toBe(reviews);
    expect(children[3].props.entrance).toBeUndefined();
    expect(children[4].props.patternTone).toBe('gold-dark');
    expect(children[6].props).toMatchObject({
      blogs,
      navigationId: 'guide-blog',
      className: 'pb-12 md:pb-16 lg:pb-24',
    });
  });

  it('keeps the canonical top-activities fallback when no activities exist', async () => {
    const children = await getGoldChildren();

    expect(children[1].props).toMatchObject({
      eyebrow: 'Top activities',
      message: 'The concierge is between picks right now. Browse the Dubai catalog while we line up the next set.',
      pivotHref: '/cities/dubai',
      pivotLabel: 'Browse Dubai experiences',
    });
  });

  it('opts only the main homepage Curate banner into the inward-frame entrance', async () => {
    const homeChildren = await getHomeChildren();
    const goldChildren = await getGoldChildren();
    const homeBanner = homeChildren.find((child) => child.type.sectionName === 'WanderersBanner');
    const goldBanner = goldChildren.find((child) => child.type.sectionName === 'WanderersBanner');

    expect(homeBanner.props.entrance).toBe('inward-frame');
    expect(goldBanner.props.entrance).toBeUndefined();
    expect(goldBanner.props.patternTone).toBe('gold-dark');
  });

  it('opts only the main homepage AI section into the guided-split entrance', async () => {
    const homeChildren = await getHomeChildren();
    const goldChildren = await getGoldChildren();
    const homeAiSection = homeChildren.find((child) => child.type.sectionName === 'AiSection');
    const goldAiSection = goldChildren.find((child) => child.type.sectionName === 'AiSection');

    expect(homeAiSection.props.entrance).toBe('guided-split');
    expect(goldAiSection.props.entrance).toBeUndefined();
  });
});
