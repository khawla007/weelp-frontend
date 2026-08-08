import { publicApi } from '@/lib/axiosInstance';

import { getAllCitiesListPublic } from '../cities';

jest.mock('@/lib/axiosInstance', () => ({
  authApi: {},
  createAuthenticatedServerApi: jest.fn(),
  publicApi: {
    get: jest.fn(),
  },
}));

describe('getAllCitiesListPublic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads every city page without exceeding the public endpoint limit', async () => {
    publicApi.get
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [{ id: 1, name: 'Dubai', slug: 'dubai' }],
          current_page: 1,
          last_page: 2,
          total: 2,
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [{ id: 2, name: 'Paris', slug: 'paris' }],
          current_page: 2,
          last_page: 2,
          total: 2,
        },
      });

    const result = await getAllCitiesListPublic();

    expect(result.data).toEqual([
      { id: 1, name: 'Dubai', slug: 'dubai' },
      { id: 2, name: 'Paris', slug: 'paris' },
    ]);
    expect(publicApi.get).toHaveBeenNthCalledWith(1, '/api/cities?per_page=50&page=1', {
      headers: { Accept: 'application/json' },
    });
    expect(publicApi.get).toHaveBeenNthCalledWith(2, '/api/cities?per_page=50&page=2', {
      headers: { Accept: 'application/json' },
    });
  });
});
