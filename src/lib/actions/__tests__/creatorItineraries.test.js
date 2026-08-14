import { revalidatePath } from 'next/cache';

import { getAuthApi } from '@/lib/axiosInstance';

import {
  adminPermanentlyDeleteCreatorItinerary,
  adminPublishCreatorItinerary,
  adminRestoreCreatorItinerary,
  getActivitiesByCity,
  getTransfersByCity,
  requestCreatorItineraryPublish,
  restoreCreatorItinerary,
  submitCreatorItineraryDraft,
} from '../creatorItineraries';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/axiosInstance', () => ({
  getAuthApi: jest.fn(),
  publicApi: {},
}));

describe('creator itinerary lifecycle actions', () => {
  const api = { post: jest.fn(), put: jest.fn(), delete: jest.fn() };

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

  it.each([
    ['restoreCreatorItinerary', () => restoreCreatorItinerary(12), 'post', '/api/creator/itineraries/12/restore'],
    ['requestCreatorItineraryPublish', () => requestCreatorItineraryPublish(12), 'post', '/api/creator/itineraries/12/request-publish'],
    ['adminRestoreCreatorItinerary', () => adminRestoreCreatorItinerary(12), 'post', '/api/admin/creator-itineraries/12/restore'],
    ['adminPublishCreatorItinerary', () => adminPublishCreatorItinerary(12), 'put', '/api/admin/creator-itineraries/12/publish'],
    ['adminPermanentlyDeleteCreatorItinerary', () => adminPermanentlyDeleteCreatorItinerary(12), 'delete', '/api/admin/creator-itineraries/12/force'],
  ])('%s calls its lifecycle endpoint and revalidates both dashboards', async (_name, action, method, endpoint) => {
    api[method].mockResolvedValue({ data: { success: true, message: 'Done', data: { id: 12 } } });

    await expect(action()).resolves.toEqual({ success: true, message: 'Done', data: { id: 12 } });

    expect(api[method]).toHaveBeenCalledWith(endpoint);
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/customer/my-itineraries');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/admin/creator-itineraries');
  });

  it.each([
    ['activities', getActivitiesByCity],
    ['transfers', getTransfersByCity],
  ])('loads %s from the role-independent authenticated itinerary resource endpoint', async (resource, action) => {
    api.get = jest.fn().mockResolvedValue({ data: { data: [{ id: 7, name: 'Available option' }] } });

    await expect(action([12])).resolves.toEqual({
      success: true,
      data: [{ id: 7, name: 'Available option' }],
    });

    expect(api.get).toHaveBeenCalledWith(`/api/user/itinerary-resources/${resource}`, { params: { city_id: 12 } });
  });
});
