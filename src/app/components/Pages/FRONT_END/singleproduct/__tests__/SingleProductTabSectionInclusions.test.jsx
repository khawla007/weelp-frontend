import { render, screen } from '@testing-library/react';

jest.mock('next/image', () => {
  const MockImage = ({ alt = '', ...props }) => <img alt={alt} {...props} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});

jest.mock('../SimilarExperiences', () => {
  const MockSimilarExperiences = () => null;
  MockSimilarExperiences.displayName = 'MockSimilarExperiences';
  return MockSimilarExperiences;
});

jest.mock('../ProductSidebar', () => {
  const MockProductSidebar = () => null;
  MockProductSidebar.displayName = 'MockProductSidebar';
  return MockProductSidebar;
});

jest.mock('../ItineraryPanel', () => {
  const MockItineraryPanel = () => <div>Itinerary panel</div>;
  MockItineraryPanel.displayName = 'MockItineraryPanel';
  return MockItineraryPanel;
});

jest.mock('../ItineraryEditActionBar', () => {
  const MockItineraryEditActionBar = () => null;
  MockItineraryEditActionBar.displayName = 'MockItineraryEditActionBar';
  return MockItineraryEditActionBar;
});

jest.mock('../SingleProductReview', () => ({
  SingleProductReview: () => null,
}));

jest.mock('@/app/components/ui/Reveal', () => {
  const MockReveal = ({ children }) => <>{children}</>;
  MockReveal.displayName = 'MockReveal';
  return MockReveal;
});

import SingleProductTabSection from '../SingleProductTabSection';

beforeEach(() => {
  window.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
  window.scrollTo = jest.fn();
});

describe('SingleProductTabSection activity inclusions', () => {
  it('passes activity inclusion rows to the public panel', () => {
    render(
      <SingleProductTabSection
        productType="activity"
        productId={1}
        productData={{
          description: 'Activity description',
          inclusions_exclusions: [{ title: 'Dynamic hotel pickup', description: 'From selected hotels.', included: true }],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    expect(screen.getByText('Dynamic hotel pickup')).toBeInTheDocument();
    expect(screen.getByText('From selected hotels.')).toBeInTheDocument();
    expect(screen.queryByText('60-Minutes Quad Bike Ride at Red dunes open desert with Fuel & Helmet')).not.toBeInTheDocument();
  });

  it('leaves non-activity fallback behavior unchanged', () => {
    render(
      <SingleProductTabSection
        productType="itinerary"
        productId={2}
        productData={{
          schedules: [{ day: 1, title: 'Day 1', activities: [], transfers: [] }],
          inclusions_exclusions: [{ title: 'Itinerary row should not be wired by this task', included: true }],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    expect(screen.getByText('Pick-up and drop off at your selected hotel/location by air-conditioned vehicle')).toBeInTheDocument();
    expect(screen.queryByText('Itinerary row should not be wired by this task')).not.toBeInTheDocument();
  });
});
