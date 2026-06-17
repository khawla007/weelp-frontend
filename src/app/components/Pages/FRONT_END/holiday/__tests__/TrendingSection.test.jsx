import { render, screen } from '@testing-library/react';

jest.mock('../../home/BrowseDestinationsSection', () => ({
  __esModule: true,
  default: jest.fn(({ cities, title, subtitleMode, navigationPrefix }) => (
    <div data-testid="browse-destinations" data-title={title} data-subtitle-mode={subtitleMode} data-navigation-prefix={navigationPrefix}>
      {cities.map((city) => (
        <span key={city.id}>{city.name}</span>
      ))}
    </div>
  )),
}));

describe('TrendingSection', () => {
  it('renders featured cities through the shared destinations carousel', () => {
    const TrendingSection = require('../TrendingSection').default;

    render(
      <TrendingSection
        cities={[
          { id: 1, name: 'Dubai', slug: 'dubai', activities_count: 12 },
          { id: 2, name: 'Abu Dhabi', slug: 'abu-dhabi', activities_count: 8 },
        ]}
      />,
    );

    const section = screen.getByTestId('browse-destinations');

    expect(section).toHaveAttribute('data-title', 'Trending Spots');
    expect(section).toHaveAttribute('data-subtitle-mode', 'count');
    expect(section).toHaveAttribute('data-navigation-prefix', 'holiday-trending-spots');
    expect(screen.getByText('Dubai')).toBeInTheDocument();
    expect(screen.getByText('Abu Dhabi')).toBeInTheDocument();
  });
});
