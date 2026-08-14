import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const mockAddItem = jest.fn();
const mockSetMiniCartOpen = jest.fn();
const mockSaveCustomerItinerary = jest.fn();
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
jest.mock('@/lib/actions/customerItineraries', () => ({
  saveCustomerItinerary: (...args) => mockSaveCustomerItinerary(...args),
}));
jest.mock('@/components/calendar', () => ({
  EMPTY_DATE_RANGE: { from: null, to: null },
  WeelpCalendar: () => <div>Calendar choices</div>,
}));
jest.mock('swr', () => ({ __esModule: true, default: () => ({ data: undefined }) }));
jest.mock('../SingleProductReview', () => ({ SingleProductReview: () => null }));

import { calculateItineraryEditPricing, useItineraryEditStore } from '@/lib/store/useItineraryEditStore';
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
  mockSaveCustomerItinerary.mockResolvedValue({ success: true, data: { id: 77, slug: 'private-copy', name: 'Dubai days' } });
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
    <ProductSidebar
      productId={9}
      productType="itinerary"
      productData={productData}
      defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }}
      scheduleCount={1}
      session={{ user: { id: 1 } }}
    />,
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

it('recalculates the itinerary sidebar from edited activity and transfer pricing', () => {
  useItineraryEditStore.setState({
    originalSchedules: [{ day: 1, activities: [{ activity_id: 1, pricing: { unit_price: 100, currency: 'USD', price_type: 'per_person' } }], transfers: [] }],
    modifiedSchedules: [
      {
        day: 1,
        activities: [{ activity_id: 1, pricing: { unit_price: 125, currency: 'USD', price_type: 'per_person' } }],
        transfers: [
          {
            transfer_id: 2,
            bag_count: 2,
            waiting_minutes: 3,
            pricing: {
              unit_price: 40,
              currency: 'USD',
              price_type: 'per_vehicle',
              luggage_per_bag: 5,
              waiting_per_minute: 2,
            },
          },
        ],
      },
    ],
    itineraryId: 9,
  });

  render(<ProductSidebar productId={9} productType="itinerary" productData={productData} defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }} scheduleCount={1} />);

  expect(screen.getByRole('heading', { name: /usd 181\.00 total for 1 guest/i })).toBeInTheDocument();
  expect(screen.getByText('USD 181.00', { selector: 'p span' })).toBeInTheDocument();
});

it('shows unavailable pricing and disables the normal booking action for invalid edits', () => {
  useItineraryEditStore.setState({
    originalSchedules: [{ day: 1, activities: [{ activity_id: 1, pricing: { unit_price: 100, currency: 'USD' } }], transfers: [] }],
    modifiedSchedules: [{ day: 1, activities: [{ activity_id: 2, pricing: { unit_price: null, currency: null } }], transfers: [] }],
    itineraryId: 9,
  });

  render(
    <ProductSidebar
      productId={9}
      productType="itinerary"
      productData={productData}
      defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }}
      scheduleCount={1}
      session={{ user: { id: 1 } }}
    />,
  );

  expect(screen.getByRole('heading', { name: 'Pricing unavailable' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Select' })).toBeDisabled();
});

it('validates, saves, and adds the returned private itinerary copy to cart', async () => {
  useItineraryEditStore.setState({
    originalSchedules: [{ day: 1, activities: [], transfers: [] }],
    modifiedSchedules: [{ day: 1, activities: [{ activity_id: 1, pricing: { unit_price: 125, currency: 'USD', price_type: 'per_person' } }], transfers: [] }],
    itineraryId: 9,
  });

  render(
    <ProductSidebar
      productId={9}
      productType="itinerary"
      productData={productData}
      citySlug="dubai"
      defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }}
      scheduleCount={1}
      session={{ user: { id: 1 } }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /save & book/i }));

  await waitFor(() => expect(mockSaveCustomerItinerary).toHaveBeenCalledTimes(1));
  expect(mockAddItem).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 77,
      type: 'itinerary',
      slug: 'private-copy',
      city_slug: 'dubai',
      howMany: { adults: 1, children: 0, infants: 0 },
      price: 125,
    }),
  );
  expect(mockSetMiniCartOpen).toHaveBeenCalledWith(true);
});

it('prevents duplicate saves while Save & Book is in progress', async () => {
  let resolveSave;
  mockSaveCustomerItinerary.mockReturnValue(new Promise((resolve) => (resolveSave = resolve)));
  useItineraryEditStore.setState({
    originalSchedules: [{ day: 1, activities: [], transfers: [] }],
    modifiedSchedules: [{ day: 1, activities: [{ activity_id: 1, pricing: { unit_price: 125, currency: 'USD', price_type: 'per_person' } }], transfers: [] }],
    itineraryId: 9,
  });

  render(
    <ProductSidebar
      productId={9}
      productType="itinerary"
      productData={productData}
      citySlug="dubai"
      defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }}
      scheduleCount={1}
      session={{ user: { id: 1 } }}
    />,
  );
  const saveButton = screen.getByRole('button', { name: /save & book/i });
  fireEvent.click(saveButton);
  fireEvent.click(saveButton);

  await waitFor(() => expect(mockSaveCustomerItinerary).toHaveBeenCalledTimes(1));
  resolveSave({ success: true, data: { id: 77, slug: 'private-copy', name: 'Dubai days' } });
  await waitFor(() => expect(mockSetMiniCartOpen).toHaveBeenCalledWith(true));
});

it('keeps pending edits and the cart unchanged when saving fails', async () => {
  mockSaveCustomerItinerary.mockResolvedValue({ success: false, message: 'Save failed' });
  const modifiedSchedules = [{ day: 1, activities: [{ activity_id: 1, pricing: { unit_price: 125, currency: 'USD', price_type: 'per_person' } }], transfers: [] }];
  useItineraryEditStore.setState({
    originalSchedules: [{ day: 1, activities: [], transfers: [] }],
    modifiedSchedules,
    itineraryId: 9,
  });

  render(
    <ProductSidebar
      productId={9}
      productType="itinerary"
      productData={productData}
      citySlug="dubai"
      defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }}
      scheduleCount={1}
      session={{ user: { id: 1 } }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /save & book/i }));

  await waitFor(() => expect(mockSaveCustomerItinerary).toHaveBeenCalledTimes(1));
  expect(mockAddItem).not.toHaveBeenCalled();
  expect(mockSetMiniCartOpen).not.toHaveBeenCalled();
  expect(useItineraryEditStore.getState().modifiedSchedules).toEqual(modifiedSchedules);
});

it('saves a new private copy after a successful customization is edited again', async () => {
  mockSaveCustomerItinerary
    .mockResolvedValueOnce({ success: true, data: { id: 77, slug: 'first-copy', name: 'Dubai days' } })
    .mockResolvedValueOnce({ success: true, data: { id: 88, slug: 'second-copy', name: 'Dubai days' } });
  useItineraryEditStore.setState({
    originalSchedules: [{ day: 1, activities: [], transfers: [] }],
    modifiedSchedules: [{ day: 1, activities: [{ activity_id: 1, pricing: { unit_price: 125, currency: 'USD', price_type: 'per_person' } }], transfers: [] }],
    itineraryId: 9,
  });

  render(
    <ProductSidebar
      productId={9}
      productType="itinerary"
      productData={productData}
      citySlug="dubai"
      defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }}
      scheduleCount={1}
      session={{ user: { id: 1 } }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /save & book/i }));
  await waitFor(() => expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({ id: 77 })));

  act(() => {
    useItineraryEditStore.setState({
      modifiedSchedules: [{ day: 1, activities: [{ activity_id: 2, pricing: { unit_price: 140, currency: 'USD', price_type: 'per_person' } }], transfers: [] }],
    });
  });
  fireEvent.click(screen.getByRole('button', { name: /save & book/i }));

  await waitFor(() => expect(mockSaveCustomerItinerary).toHaveBeenCalledTimes(2));
  expect(mockAddItem).toHaveBeenLastCalledWith(expect.objectContaining({ id: 88, price: 140 }));
});

describe('calculateItineraryEditPricing', () => {
  it('handles multi-guest activity, per-person transfer, flat transfer extras, and decimal rounding', () => {
    const pricing = calculateItineraryEditPricing(
      [
        {
          activities: [{ pricing: { unit_price: 10.115, currency: 'usd' } }],
          transfers: [
            { pricing: { unit_price: 5.125, price_type: 'per_person', currency: 'USD' } },
            { bag_count: 2, waiting_minutes: 3, pricing: { unit_price: 20.1, price_type: 'per_vehicle', currency: 'USD', luggage_per_bag: 1.25, waiting_per_minute: 0.5 } },
          ],
        },
      ],
      3,
    );

    expect(pricing).toEqual({ perPaxTotal: 15.24, flatTotal: 24.1, total: 69.82, currency: 'USD' });
  });

  it('recalculates add, change, and remove schedule states independently', () => {
    const row = (unitPrice) => ({ activity_id: 1, pricing: { unit_price: unitPrice, currency: 'USD' } });
    expect(calculateItineraryEditPricing([{ activities: [row(10)], transfers: [] }], 1)?.total).toBe(10);
    expect(calculateItineraryEditPricing([{ activities: [row(10), row(20)], transfers: [] }], 1)?.total).toBe(30);
    expect(calculateItineraryEditPricing([{ activities: [row(15)], transfers: [] }], 1)?.total).toBe(15);
  });

  it.each([
    ['an empty schedule', [{ activities: [], transfers: [] }]],
    ['a missing unit price', [{ activities: [{ pricing: { unit_price: null, currency: 'USD' } }], transfers: [] }]],
    ['a missing currency', [{ activities: [{ pricing: { unit_price: 10, currency: null } }], transfers: [] }]],
    ['mixed currencies', [{ activities: [{ pricing: { unit_price: 10, currency: 'USD' } }, { pricing: { unit_price: 10, currency: 'EUR' } }], transfers: [] }]],
  ])('rejects %s', (_label, schedules) => {
    expect(calculateItineraryEditPricing(schedules, 1)).toBeNull();
  });

  it('rejects a uniformly different currency from the itinerary currency', () => {
    const schedules = [{ activities: [{ pricing: { unit_price: 10, currency: 'EUR' } }], transfers: [] }];

    expect(calculateItineraryEditPricing(schedules, 1, 'USD')).toBeNull();
  });
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
