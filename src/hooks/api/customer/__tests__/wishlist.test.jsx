import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';

import { useWishlistItems } from '../wishlist';
import { addWishlistItem, getWishlistItems, removeWishlistItemByIdentity } from '@/lib/services/customer/wishlist';

jest.mock('@/lib/services/customer/wishlist', () => ({
  addWishlistItem: jest.fn(),
  getWishlistItems: jest.fn(),
  removeWishlistItem: jest.fn(),
  removeWishlistItemByIdentity: jest.fn(),
}));

function createWrapper() {
  const cache = new Map();

  return function Wrapper({ children }) {
    return <SWRConfig value={{ provider: () => cache, dedupingInterval: 0 }}>{children}</SWRConfig>;
  };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

const desertSafari = {
  item_type: 'activity',
  item_id: 42,
  title: 'Desert Safari',
};

describe('useWishlistItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getWishlistItems.mockReset().mockResolvedValue({ success: true, data: [] });
  });

  it('does not fetch wishlist data when disabled', () => {
    const { result } = renderHook(() => useWishlistItems({ enabled: false }), { wrapper: createWrapper() });

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(getWishlistItems).not.toHaveBeenCalled();
  });

  it('loads every wishlist page into the shared cache', async () => {
    const museumTour = { id: 10, item_type: 'itinerary', item_id: 77, title: 'Museum Tour' };
    getWishlistItems
      .mockResolvedValueOnce({
        success: true,
        data: [{ id: 9, ...desertSafari }],
        meta: { current_page: 1, last_page: 2, per_page: 50, total: 2 },
      })
      .mockResolvedValueOnce({
        success: true,
        data: [museumTour],
        meta: { current_page: 2, last_page: 2, per_page: 50, total: 2 },
      });

    const { result } = renderHook(() => useWishlistItems(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.items).toEqual([expect.objectContaining(desertSafari), museumTour]));
    expect(getWishlistItems).toHaveBeenNthCalledWith(1, { page: 1, per_page: 50 });
    expect(getWishlistItems).toHaveBeenNthCalledWith(2, { page: 2, per_page: 50 });
  });

  it('shares an optimistic saved item before the request settles', async () => {
    const save = deferred();
    addWishlistItem.mockReturnValue(save.promise);
    const { result } = renderHook(() => ({ first: useWishlistItems(), second: useWishlistItems() }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.first.isLoading).toBe(false));

    let savePromise;
    act(() => {
      savePromise = result.current.first.addItem(desertSafari);
    });

    await waitFor(() => {
      expect(result.current.second.items).toEqual([expect.objectContaining(desertSafari)]);
    });

    save.resolve({ success: true, data: { id: 9, ...desertSafari } });
    await act(async () => savePromise);
  });

  it('rolls back only the optimistic item when a save fails', async () => {
    const saveError = new Error('Save failed');
    addWishlistItem.mockRejectedValue(saveError);
    const { result } = renderHook(() => ({ first: useWishlistItems(), second: useWishlistItems() }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.first.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.first.addItem(desertSafari)).rejects.toBe(saveError);
    });

    expect(result.current.first.items).toEqual([]);
    expect(result.current.second.items).toEqual([]);
  });

  it('does not erase another successful save when an overlapping save fails', async () => {
    const saveA = deferred();
    const saveB = deferred();
    const museumTour = { item_type: 'itinerary', item_id: 77, title: 'Museum Tour' };
    addWishlistItem.mockImplementation((payload) => (payload.item_id === 42 ? saveA.promise : saveB.promise));
    getWishlistItems.mockResolvedValueOnce({ success: true, data: [] }).mockResolvedValue({ success: true, data: [{ id: 10, ...museumTour }] });
    const { result } = renderHook(() => useWishlistItems(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let promiseA;
    let promiseB;
    act(() => {
      promiseA = result.current.addItem(desertSafari);
      promiseB = result.current.addItem(museumTour);
    });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    saveB.resolve({ success: true, data: { id: 10, ...museumTour } });
    await act(async () => promiseB);
    saveA.reject(new Error('First save failed'));
    await act(async () => {
      await expect(promiseA).rejects.toThrow('First save failed');
    });

    expect(result.current.items).toEqual([expect.objectContaining(museumTour)]);
  });

  it('optimistically removes and restores only the rejected identity', async () => {
    const removal = deferred();
    const savedItem = { id: 9, ...desertSafari };
    getWishlistItems.mockResolvedValue({ success: true, data: [savedItem] });
    removeWishlistItemByIdentity.mockReturnValue(removal.promise);
    const { result } = renderHook(() => useWishlistItems(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.items).toEqual([savedItem]));

    let removalPromise;
    act(() => {
      removalPromise = result.current.removeItemByIdentity('activity', 42);
    });
    await waitFor(() => expect(result.current.items).toEqual([]));

    removal.reject(new Error('Remove failed'));
    await act(async () => {
      await expect(removalPromise).rejects.toThrow('Remove failed');
    });

    expect(result.current.items).toEqual([savedItem]);
  });
});
