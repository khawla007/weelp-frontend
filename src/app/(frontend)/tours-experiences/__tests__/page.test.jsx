import { render } from '@testing-library/react';

import ToursExperiencesPage from '../page';
import { getFeaturedCitiesWithStartingPrice } from '@/lib/services/tours';

jest.mock('@/lib/services/tours', () => ({
  getFeaturedCitiesWithStartingPrice: jest.fn(),
}));

jest.mock('@/app/components/Pages/FRONT_END/tours/ToursHero', () => {
  return function ToursHeroMock() {
    return <section data-testid="tours-hero" />;
  };
});

jest.mock('@/app/components/Pages/FRONT_END/home/BrowseDestinationsSection', () => {
  return function BrowseDestinationsSectionMock(props) {
    return <section data-testid="browse-destinations" data-props={JSON.stringify(props)} />;
  };
});

describe('ToursExperiencesPage', () => {
  it('renders the hero and destinations as direct sibling sections', async () => {
    const cities = [{ id: 1, name: 'Dubai' }];
    getFeaturedCitiesWithStartingPrice.mockResolvedValue(cities);

    const { container, getByTestId } = render(await ToursExperiencesPage());

    const main = container.querySelector('main');
    expect(Array.from(main.children)).toEqual([getByTestId('tours-hero'), getByTestId('browse-destinations')]);
    expect(JSON.parse(getByTestId('browse-destinations').dataset.props)).toEqual({
      cities,
      title: 'Trending Spots',
      subtitleMode: 'price',
      navigationPrefix: 'trending-spots',
    });
  });

  it('keeps the destinations section available when featured-city loading fails', async () => {
    getFeaturedCitiesWithStartingPrice.mockRejectedValue(new Error('Unavailable'));

    const { getByTestId } = render(await ToursExperiencesPage());

    expect(JSON.parse(getByTestId('browse-destinations').dataset.props).cities).toEqual([]);
  });
});
