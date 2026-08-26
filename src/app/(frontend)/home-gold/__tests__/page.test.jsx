import { Children } from 'react';

import HomePage, { revalidate as homeRevalidate } from '../../page';
import GoldHomePage, { revalidate as goldRevalidate } from '../page';
import WeelpRecommendations from '@/app/components/Pages/FRONT_END/home/WeelpRecommendations';
import { publicApi } from '@/lib/axiosInstance';
import { getAllFeaturedActivities } from '@/lib/services/activites';
import { getAllFeaturedCities } from '@/lib/services/cities';
import { getPublicReviews } from '@/lib/services/reviews';

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader) => {
    const source = loader.toString();
    const sectionName = ['ProductSliderSection', 'BrowseDestinationsSection', 'TestimonialSection', 'WanderersBanner', 'AiSection', 'BlogSection'].find((name) => source.includes(name));
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

  it('renders featured activities through the shared canonical product section', async () => {
    const activities = [{ id: 1, item_type: 'activity', name: 'Desert safari', slug: 'desert-safari', city_slug: 'dubai' }];
    getAllFeaturedActivities.mockResolvedValue(activities);

    const children = await getGoldChildren();

    expect(children[1].type.sectionName).toBe('ProductSliderSection');
    expect(children[1].props).toMatchObject({
      title: 'Top activities',
      navigationId: 'top-activities',
      className: 'pb-12 md:pb-16 lg:pb-24',
    });
    expect(children[1].props.carouselEntrance).toBeUndefined();
    expect(children[1].props.items[0]).toMatchObject({
      id: 1,
      title: 'Desert safari',
      wishlistItem: {
        item_type: 'activity',
        item_id: 1,
        title: 'Desert safari',
        slug: 'desert-safari',
        city_slug: 'dubai',
      },
    });
  });

  it('preserves non-target section order and key props', async () => {
    const activities = [{ id: 1, item_type: 'activity', name: 'Desert safari', slug: 'desert-safari', city_slug: 'dubai' }];
    const cities = [{ id: 2, name: 'Paris', slug: 'paris' }];
    const blogs = [{ id: 3, title: 'A local guide' }];
    const reviews = [{ id: 4, comment: 'Wonderful' }];
    getAllFeaturedActivities.mockResolvedValue(activities);
    getAllFeaturedCities.mockResolvedValue(cities);
    getPublicReviews.mockResolvedValue({ data: reviews });
    publicApi.get.mockResolvedValue({ data: { data: blogs } });

    const children = await getGoldChildren();

    expect(children).toHaveLength(8);
    expect(children[1].type.sectionName).toBe('ProductSliderSection');
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

  it('opts only the main homepage guide into the editorial-right entrance', async () => {
    publicApi.get.mockResolvedValue({
      data: { data: [{ id: 3, title: 'A local guide' }] },
    });

    const homeChildren = await getHomeChildren();
    const goldChildren = await getGoldChildren();
    const homeGuide = homeChildren.find((child) => child.type.sectionName === 'BlogSection');
    const goldGuide = goldChildren.find((child) => child.type.sectionName === 'BlogSection');

    expect(homeGuide).toBeDefined();
    expect(goldGuide).toBeDefined();
    expect(homeGuide.props.entrance).toBe('editorial-right');
    expect(goldGuide.props.entrance).toBeUndefined();
  });

  it('opts only the main homepage recommendations into the rule-led cascade', async () => {
    const homeChildren = await getHomeChildren();
    const goldChildren = await getGoldChildren();
    const homeRecommendations = homeChildren.find((child) => child.type === WeelpRecommendations);
    const goldRecommendations = goldChildren.find((child) => child.type === WeelpRecommendations);

    expect(homeRecommendations).toBeDefined();
    expect(goldRecommendations).toBeDefined();
    expect(homeRecommendations.props.entrance).toBe('rule-led-cascade');
    expect(goldRecommendations.props.entrance).toBeUndefined();
  });
});
