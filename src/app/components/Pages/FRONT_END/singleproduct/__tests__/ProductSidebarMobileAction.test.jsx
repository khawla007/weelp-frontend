import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const mockAddItem = jest.fn();
const mockSetMiniCartOpen = jest.fn();
let actionObserverCallback;

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({ cartItems: [], setMiniCartOpen: mockSetMiniCartOpen, addItem: mockAddItem }),
}));

jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/components/calendar', () => ({
  EMPTY_DATE_RANGE: { from: null, to: null },
  WeelpCalendar: () => <div>Calendar choices</div>,
}));
jest.mock('swr', () => ({ __esModule: true, default: () => ({ data: undefined }) }));
jest.mock('../SingleProductReview', () => ({ SingleProductReview: () => null }));

import { useItineraryEditStore } from '@/lib/store/useItineraryEditStore';
import ItineraryEditActionBar from '../ItineraryEditActionBar';
import ProductSidebar from '../ProductSidebar';

const productData = {
  id: 9,
  item_type: 'itinerary',
  name: 'Dubai days',
  schedule_total_price: 300,
  schedule_total_currency: 'USD',
  addons: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  useItineraryEditStore.setState({
    originalSchedules: [],
    modifiedSchedules: [],
    itineraryId: null,
  });
  actionObserverCallback = undefined;
  window.IntersectionObserver = jest.fn((callback) => {
    actionObserverCallback = callback;
    return { observe: jest.fn(), disconnect: jest.fn() };
  });
});

it('gives a pending itinerary edit action priority over the mobile booking bar', () => {
  useItineraryEditStore.setState({
    originalSchedules: [{ day: 1, title: 'Original day' }],
    modifiedSchedules: [{ day: 1, title: 'Updated day' }],
    itineraryId: 9,
  });

  render(
    <>
      <ProductSidebar productId={9} productType="itinerary" productData={productData} defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }} scheduleCount={1} />
      <ItineraryEditActionBar session={{ user: { id: 1 } }} />
    </>,
  );

  act(() => actionObserverCallback([{ isIntersecting: false, intersectionRatio: 0 }]));

  expect(screen.getByRole('button', { name: /save & book/i })).toBeInTheDocument();
  expect(screen.queryByTestId('mobile-booking-bar')).not.toBeInTheDocument();
  expect(screen.getByTestId('booking-action')).toBeInTheDocument();
});

it('does not suppress booking for pending edits from a different itinerary', () => {
  useItineraryEditStore.setState({
    originalSchedules: [{ day: 1, title: 'Original day' }],
    modifiedSchedules: [{ day: 1, title: 'Updated day' }],
    itineraryId: 99,
  });

  render(<ProductSidebar productId={9} productType="itinerary" productData={productData} defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }} scheduleCount={1} />);

  act(() => actionObserverCallback([{ isIntersecting: false, intersectionRatio: 0 }]));

  expect(screen.getByTestId('mobile-booking-bar')).toBeInTheDocument();
});

it('submits the existing valid form exactly once from the portaled mobile action', async () => {
  render(<ProductSidebar productId={9} productType="itinerary" productData={productData} defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }} scheduleCount={1} />);

  act(() => actionObserverCallback([{ isIntersecting: false, intersectionRatio: 0 }]));
  fireEvent.click(within(screen.getByTestId('mobile-booking-bar')).getByRole('button', { name: 'Select' }));
  await waitFor(() => expect(mockAddItem).toHaveBeenCalledTimes(1));
  expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({ id: 9, type: 'itinerary' }));
});

it('suppresses the mobile action while traveler or date selectors are open', async () => {
  render(<ProductSidebar productId={9} productType="itinerary" productData={productData} defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }} scheduleCount={1} />);

  act(() => actionObserverCallback([{ isIntersecting: false, intersectionRatio: 0 }]));
  expect(screen.getByTestId('mobile-booking-bar')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '1 Travelers' }));
  await waitFor(() => expect(screen.queryByTestId('mobile-booking-bar')).not.toBeInTheDocument());
  fireEvent.mouseLeave(screen.getByRole('dialog', { name: 'Traveler selector' }));
  await waitFor(() => expect(screen.getByTestId('mobile-booking-bar')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /sep 10 - sep 10/i }));
  await waitFor(() => expect(screen.queryByTestId('mobile-booking-bar')).not.toBeInTheDocument());
});
