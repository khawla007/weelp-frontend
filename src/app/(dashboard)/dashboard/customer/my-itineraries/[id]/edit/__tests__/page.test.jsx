const auth = jest.fn();
const redirect = jest.fn(() => {
  throw new Error('NEXT_REDIRECT');
});
const getDraftItinerary = jest.fn();
const getAllCitiesListPublic = jest.fn();
const getAllTransfersCreator = jest.fn();

jest.mock('@/lib/auth/auth', () => ({ auth: (...args) => auth(...args) }));
jest.mock('next/navigation', () => ({
  redirect: (...args) => redirect(...args),
  notFound: jest.fn(),
}));
jest.mock('@/lib/actions/creatorItineraries', () => ({
  getDraftItinerary: (...args) => getDraftItinerary(...args),
}));
jest.mock('@/lib/services/cities', () => ({
  getAllCitiesListPublic: (...args) => getAllCitiesListPublic(...args),
}));
jest.mock('@/lib/services/transfers', () => ({
  getAllTransfersCreator: (...args) => getAllTransfersCreator(...args),
}));
jest.mock('@/app/components/Pages/FRONT_END/creator-itinerary-form/CreatorItineraryFormShell', () => ({
  __esModule: true,
  default: () => null,
}));

describe('EditItineraryDraftPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ user: { id: 12, is_creator: true } });
    getDraftItinerary.mockResolvedValue({ success: true, data: {} });
    getAllCitiesListPublic.mockResolvedValue({ data: [] });
    getAllTransfersCreator.mockResolvedValue(null);
  });

  it('redirects when the backend has removed creator access from a stale session', async () => {
    const EditItineraryDraftPage = (await import('../page')).default;

    await expect(EditItineraryDraftPage({ params: Promise.resolve({ id: '42' }) })).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toHaveBeenCalledWith('/dashboard/customer');
  });
});
