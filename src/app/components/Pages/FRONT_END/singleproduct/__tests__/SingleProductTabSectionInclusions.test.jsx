import { fireEvent, render, screen, waitFor } from '@testing-library/react';

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
  const MockItineraryPanel = () => (
    <div>
      <h2>Itinerary</h2>
      <div>Itinerary panel</div>
    </div>
  );
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

let observeMock;

beforeEach(() => {
  observeMock = jest.fn();
  window.IntersectionObserver = class {
    observe = observeMock;
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
  it('contains the detail tabs in a horizontally scrollable mobile strip', () => {
    render(
      <SingleProductTabSection
        productType="activity"
        productId={1}
        productData={{
          description: 'Activity description',
          inclusions_exclusions: [{ title: 'Pickup', included: true }],
          review_summary: { total_reviews: 2 },
          faqs: [],
        }}
      />,
    );

    const tabList = screen.getByRole('button', { name: 'Overview' }).parentElement;

    expect(tabList).toHaveClass('overflow-x-auto', 'justify-start', 'sm:justify-center');
    expect(screen.getByRole('button', { name: 'Overview' })).toHaveClass('shrink-0');
    expect(screen.getByRole('button', { name: 'Overview' })).not.toHaveStyle({ marginRight: '44px' });
  });

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

  it("hides the What's Included tab and section when activity inclusion rows are empty", () => {
    render(
      <SingleProductTabSection
        productType="activity"
        productId={1}
        productData={{
          description: 'Activity description',
          inclusions_exclusions: [],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    expect(screen.queryByRole('button', { name: "What's Included" })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: "What's Included" })).not.toBeInTheDocument();
    expect(screen.queryByText('Pick-up and drop off at your selected hotel/location by air-conditioned vehicle')).not.toBeInTheDocument();
  });

  it("hides the What's Included tab and section when inclusion rows have no meaningful title", () => {
    render(
      <SingleProductTabSection
        productType="activity"
        productId={1}
        productData={{
          description: 'Activity description',
          inclusions_exclusions: [
            { title: '   ', description: 'Whitespace title should not count.', included: true },
            { text: '   ', description: 'Whitespace text should not count.', included: true },
          ],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    expect(screen.queryByRole('button', { name: "What's Included" })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: "What's Included" })).not.toBeInTheDocument();
  });

  it('passes itinerary inclusion rows to the public panel', () => {
    render(
      <SingleProductTabSection
        productType="itinerary"
        productId={2}
        productData={{
          schedules: [{ day: 1, title: 'Day 1', activities: [], transfers: [] }],
          inclusions_exclusions: [{ title: 'Private airport transfer', description: 'One-way pickup included.', included: true }],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    expect(screen.getByRole('button', { name: "What's Included" })).toBeInTheDocument();
    expect(screen.getByText('Private airport transfer')).toBeInTheDocument();
    expect(screen.getByText('One-way pickup included.')).toBeInTheDocument();
    expect(screen.queryByText('Pick-up and drop off at your selected hotel/location by air-conditioned vehicle')).not.toBeInTheDocument();
  });

  it("hides the What's Included tab and section when itinerary inclusion rows are empty", () => {
    render(
      <SingleProductTabSection
        productType="itinerary"
        productId={2}
        productData={{
          schedules: [{ day: 1, title: 'Day 1', activities: [], transfers: [] }],
          inclusions_exclusions: [],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    expect(screen.queryByRole('button', { name: "What's Included" })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: "What's Included" })).not.toBeInTheDocument();
    expect(screen.queryByText('Pick-up and drop off at your selected hotel/location by air-conditioned vehicle')).not.toBeInTheDocument();
  });

  it('hides the FAQ tab and section when the itinerary has no FAQs', () => {
    render(
      <SingleProductTabSection
        productType="itinerary"
        productId={2}
        productData={{
          schedules: [{ day: 1, title: 'Day 1', activities: [], transfers: [] }],
          inclusions_exclusions: [],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    expect(screen.queryByRole('button', { name: 'FAQs' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'FAQs' })).not.toBeInTheDocument();
    expect(document.getElementById('tab_4')).not.toBeInTheDocument();
  });

  it('uses compact mobile spacing before itinerary details without changing larger breakpoints', () => {
    const { unmount } = render(
      <SingleProductTabSection
        productType="itinerary"
        productId={2}
        productData={{
          schedules: [{ day: 1, title: 'Day 1', activities: [], transfers: [] }],
          inclusions_exclusions: [],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    const itinerarySection = document.getElementById('tab_1');
    expect(itinerarySection).toHaveClass('pt-8', 'md:pt-[70px]');
    expect(itinerarySection).not.toHaveClass('pt-[70px]');

    unmount();

    render(
      <SingleProductTabSection
        productType="activity"
        productId={1}
        productData={{
          description: 'Activity description',
          inclusions_exclusions: [],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    const activitySection = document.getElementById('tab_1');
    expect(activitySection).toHaveClass('pt-[70px]');
    expect(activitySection).not.toHaveClass('pt-8');
    expect(activitySection).not.toHaveClass('md:pt-[70px]');
  });

  it("observes the What's Included section when rows are added after initial render", () => {
    const { rerender } = render(
      <SingleProductTabSection
        productType="activity"
        productId={1}
        productData={{
          description: 'Activity description',
          inclusions_exclusions: [],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    expect(screen.queryByRole('button', { name: "What's Included" })).not.toBeInTheDocument();

    rerender(
      <SingleProductTabSection
        productType="activity"
        productId={1}
        productData={{
          description: 'Activity description',
          inclusions_exclusions: [{ title: 'Dynamic hotel pickup', included: true }],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    expect(screen.getByRole('button', { name: "What's Included" })).toBeInTheDocument();
    expect(observeMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'tab_2' }));
  });

  it('resets the active tab when inclusion rows disappear after tab selection', async () => {
    const { rerender } = render(
      <SingleProductTabSection
        productType="activity"
        productId={1}
        productData={{
          description: 'Activity description',
          inclusions_exclusions: [{ title: 'Dynamic hotel pickup', included: true }],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: "What's Included" }));
    expect(screen.getByRole('button', { name: "What's Included" })).toHaveAttribute('aria-current', 'true');

    rerender(
      <SingleProductTabSection
        productType="activity"
        productId={1}
        productData={{
          description: 'Activity description',
          inclusions_exclusions: [],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'true'));
    expect(screen.queryByRole('button', { name: "What's Included" })).not.toBeInTheDocument();
  });

  it('scrolls tab clicks to the section heading below the fixed header and tabs', () => {
    jest.useFakeTimers();
    render(
      <SingleProductTabSection
        productType="activity"
        productId={1}
        productData={{
          description: 'Activity description',
          inclusions_exclusions: [{ title: 'Dynamic hotel pickup', included: true }],
          review_summary: { total_reviews: 0 },
          faqs: [{ question: 'What should I bring?', answer: 'Comfortable clothing.' }],
        }}
      />,
    );

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1000 });

    const faqSection = document.getElementById('tab_4');
    const faqHeading = screen.getByRole('heading', { name: 'FAQs' });

    faqSection.getBoundingClientRect = jest.fn(() => ({ top: 500 }));
    faqHeading.getBoundingClientRect = jest.fn(() => ({ top: 560 }));

    fireEvent.click(screen.getByRole('button', { name: 'FAQs' }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1418, behavior: 'smooth' });

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1300 });
    faqHeading.getBoundingClientRect = jest.fn(() => ({ top: 300 }));

    jest.advanceTimersByTime(800);

    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 1458, behavior: 'smooth' });
    jest.useRealTimers();
  });

  it('scrolls the itinerary tab to the itinerary section wrapper instead of the sticky title row', () => {
    render(
      <SingleProductTabSection
        productType="itinerary"
        productId={2}
        productData={{
          schedules: [{ day: 1, title: 'Day 1', activities: [], transfers: [] }],
          inclusions_exclusions: [{ title: 'Private airport transfer', included: true }],
          review_summary: { total_reviews: 0 },
          faqs: [],
        }}
      />,
    );

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 3000 });

    const itinerarySection = document.getElementById('tab_1');
    const itineraryHeading = screen.getByRole('heading', { name: 'Itinerary' });

    itinerarySection.getBoundingClientRect = jest.fn(() => ({ top: -2400 }));
    itineraryHeading.getBoundingClientRect = jest.fn(() => ({ top: -2328 }));

    fireEvent.click(screen.getByRole('button', { name: 'Itinerary' }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 458, behavior: 'smooth' });
  });

  it('cancels delayed tab scroll corrections when the user manually scrolls', () => {
    jest.useFakeTimers();
    render(
      <SingleProductTabSection
        productType="activity"
        productId={1}
        productData={{
          description: 'Activity description',
          inclusions_exclusions: [{ title: 'Dynamic hotel pickup', included: true }],
          review_summary: { total_reviews: 0 },
          faqs: [{ question: 'What should I bring?', answer: 'Comfortable clothing.' }],
        }}
      />,
    );

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1000 });

    const faqHeading = screen.getByRole('heading', { name: 'FAQs' });
    faqHeading.getBoundingClientRect = jest.fn(() => ({ top: 560 }));

    fireEvent.click(screen.getByRole('button', { name: 'FAQs' }));
    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new WheelEvent('wheel'));
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 100 });
    faqHeading.getBoundingClientRect = jest.fn(() => ({ top: 1200 }));

    jest.advanceTimersByTime(2400);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
