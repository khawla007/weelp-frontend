import { authApi } from '../../axiosInstance';
import { getBookingMix } from '../dashboard';

jest.mock('../../axiosInstance', () => ({ authApi: { get: jest.fn() } }));

describe('dashboard service', () => {
  it('returns the booking mix response data', async () => {
    const data = { total: 0, categories: [], leaders: [] };
    authApi.get.mockResolvedValue({ data: { data } });

    await expect(getBookingMix()).resolves.toEqual(data);
    expect(authApi.get).toHaveBeenCalledWith('/api/admin/dashboard/booking-mix');
  });
});
