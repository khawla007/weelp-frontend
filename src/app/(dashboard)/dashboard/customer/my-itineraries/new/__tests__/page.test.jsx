const auth = jest.fn();
const redirect = jest.fn(() => {
  throw new Error('NEXT_REDIRECT');
});
const getAllCitiesListPublic = jest.fn();
const getAllTransfersCreator = jest.fn();

jest.mock('@/lib/auth/auth', () => ({
  auth: (...args) => auth(...args),
}));

jest.mock('next/navigation', () => ({
  redirect: (...args) => redirect(...args),
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

describe('CreateItineraryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ user: { id: 12, is_creator: true } });
    getAllCitiesListPublic.mockResolvedValue({ data: [] });
    getAllTransfersCreator.mockResolvedValue([]);
  });

  it('redirects when the backend has removed creator access from a stale session', async () => {
    getAllTransfersCreator.mockResolvedValue(null);
    const CreateItineraryPage = (await import('../page')).default;

    await expect(CreateItineraryPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toHaveBeenCalledWith('/dashboard/customer');
  });
});
