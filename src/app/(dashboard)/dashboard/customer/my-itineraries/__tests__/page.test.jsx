import { render, screen } from '@testing-library/react';

const auth = jest.fn();
const getMyItineraries = jest.fn();
const getCreatorMyItineraries = jest.fn();

jest.mock('@/lib/auth/auth', () => ({
  auth: (...args) => auth(...args),
}));

jest.mock('@/lib/actions/customerItineraries', () => ({
  getMyItineraries: (...args) => getMyItineraries(...args),
}));

jest.mock('@/lib/actions/creatorItineraries', () => ({
  getCreatorMyItineraries: (...args) => getCreatorMyItineraries(...args),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('../MyItinerariesClientWrapper', () => ({
  __esModule: true,
  default: ({ initialItineraries, isCreator }) => (
    <div data-testid="itinerary-list" data-is-creator={String(isCreator)}>
      {initialItineraries.map((itinerary) => itinerary.name).join(', ')}
    </div>
  ),
}));

describe('MyItinerariesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMyItineraries.mockResolvedValue({ success: true, data: { data: [] } });
    getCreatorMyItineraries.mockResolvedValue({ success: true, data: { data: [] } });
  });

  it('loads both saved and created itineraries from the unified customer endpoint', async () => {
    auth.mockResolvedValue({ user: { id: 4, is_creator: true } });
    getMyItineraries.mockResolvedValue({
      success: true,
      data: {
        data: [
          { id: 36, name: 'Creator Dubai Weekend' },
          { id: 52, name: 'Saved Paris Weekend' },
        ],
        last_page: 1,
      },
    });

    const MyItinerariesPage = (await import('../page')).default;
    render(await MyItinerariesPage());

    expect(getMyItineraries).toHaveBeenCalledTimes(1);
    expect(getCreatorMyItineraries).not.toHaveBeenCalled();
    expect(screen.getByTestId('itinerary-list')).toHaveTextContent('Creator Dubai Weekend, Saved Paris Weekend');
  });

  it('keeps customer collections on the customer itinerary endpoint', async () => {
    auth.mockResolvedValue({ user: { id: 8, is_creator: false } });
    getMyItineraries.mockResolvedValue({
      success: true,
      data: { data: [{ id: 52, name: 'Saved Paris Weekend' }], last_page: 1 },
    });

    const MyItinerariesPage = (await import('../page')).default;
    render(await MyItinerariesPage());

    expect(getMyItineraries).toHaveBeenCalledTimes(1);
    expect(getCreatorMyItineraries).not.toHaveBeenCalled();
    expect(screen.getByTestId('itinerary-list')).toHaveTextContent('Saved Paris Weekend');
  });
});
