import { revalidatePath } from 'next/cache';

import { getAuthApi } from '@/lib/axiosInstance';

import { submitCreatorItineraryDraft } from '../creatorItineraries';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/axiosInstance', () => ({
  getAuthApi: jest.fn(),
  publicApi: {},
}));

describe('submitCreatorItineraryDraft', () => {
  const api = { post: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    getAuthApi.mockResolvedValue(api);
  });

  it('invalidates My Itineraries after a successful creator submission', async () => {
    const payload = { name: 'Creator Dubai Weekend', locations: [1], schedules: [{ day: 1 }] };
    api.post.mockResolvedValue({
      data: {
        message: 'Itinerary submitted for approval.',
        data: { id: 36, ...payload },
      },
    });

    await expect(submitCreatorItineraryDraft(payload)).resolves.toEqual({
      success: true,
      message: 'Itinerary submitted for approval.',
      data: { id: 36, ...payload },
    });

    expect(api.post).toHaveBeenCalledWith('/api/creator/itineraries/create', payload);
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/customer/my-itineraries');
  });
});
