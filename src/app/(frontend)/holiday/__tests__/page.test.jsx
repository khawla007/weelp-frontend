import { render } from '@testing-library/react';

import HolidayPage from '../page';
import { getAllFeaturedCities } from '@/lib/services/cities';

jest.mock('@/lib/services/cities', () => ({
  getAllFeaturedCities: jest.fn(),
}));

jest.mock('@/app/components/Pages/FRONT_END/holiday/BannerSection', () => {
  return function BannerSectionMock() {
    return <section data-testid="holiday-hero" />;
  };
});

jest.mock('@/app/components/Pages/FRONT_END/home/BrowseDestinationsSection', () => {
  return function BrowseDestinationsSectionMock(props) {
    return <section data-testid="browse-destinations" data-props={JSON.stringify(props)} />;
  };
});

describe('HolidayPage', () => {
  it.each([
    ['an array response', [{ id: 1, name: 'Paris' }]],
    ['a data-wrapped response', { data: [{ id: 2, name: 'Rome' }] }],
  ])('renders direct sibling sections for %s', async (_label, response) => {
    getAllFeaturedCities.mockResolvedValue(response);

    const { container, getByTestId } = render(await HolidayPage());
    const expectedCities = Array.isArray(response) ? response : response.data;

    expect(Array.from(container.children)).toEqual([getByTestId('holiday-hero'), getByTestId('browse-destinations')]);
    expect(JSON.parse(getByTestId('browse-destinations').dataset.props)).toEqual({
      cities: expectedCities,
      title: 'Trending Spots',
      subtitleMode: 'count',
      navigationPrefix: 'holiday-trending-spots',
    });
  });

  it('passes an empty city list through to the destinations section', async () => {
    getAllFeaturedCities.mockResolvedValue({});

    const { getByTestId } = render(await HolidayPage());

    expect(JSON.parse(getByTestId('browse-destinations').dataset.props).cities).toEqual([]);
  });
});
