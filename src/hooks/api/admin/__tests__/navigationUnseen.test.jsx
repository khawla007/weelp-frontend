import { StrictMode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';

import { ADMIN_NAVIGATION_UNSEEN_REFRESH_INTERVAL, newestCreatedAt, useAdminNavigationUnseen, useMarkAdminNavigationSeen } from '../navigationUnseen';
import { fetchAdminNavigationUnseen, markAdminNavigationSeen } from '@/lib/services/adminNavigationUnseen';

jest.mock('@/lib/services/adminNavigationUnseen', () => ({
  ADMIN_NAVIGATION_UNSEEN_KEY: '/api/admin/navigation-unseen-counts',
  fetchAdminNavigationUnseen: jest.fn(),
  markAdminNavigationSeen: jest.fn(),
  normalizeAdminNavigationCounts: jest.requireActual('@/lib/services/adminNavigationUnseen').normalizeAdminNavigationCounts,
}));

function createWrapper({ strict = false } = {}) {
  const cache = new Map();

  return function Wrapper({ children }) {
    const content = <SWRConfig value={{ provider: () => cache, dedupingInterval: 0, shouldRetryOnError: false }}>{children}</SWRConfig>;
    return strict ? <StrictMode>{content}</StrictMode> : content;
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

let fakeTimersActive = false;

function useTestFakeTimers() {
  jest.useFakeTimers();
  fakeTimersActive = true;
}

afterEach(() => {
  if (fakeTimersActive) {
    jest.clearAllTimers();
    jest.useRealTimers();
    fakeTimersActive = false;
  }
});

describe('useAdminNavigationUnseen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchAdminNavigationUnseen.mockReset().mockResolvedValue({ counts: { orders: 7, reviews: 3 }, attention: { cancellations: true } });
    markAdminNavigationSeen.mockReset();
  });

  it('shares one fetch across hook consumers and exposes normalized counts', async () => {
    const { result } = renderHook(() => ({ first: useAdminNavigationUnseen(), second: useAdminNavigationUnseen() }), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.first.counts).toEqual({ orders: 7, reviews: 3 }));
    expect(result.current.second.counts).toEqual({ orders: 7, reviews: 3 });
    expect(result.current.first.attention).toEqual({ cancellations: true });
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(1);
  });

  it('polls using the exported thirty-second refresh interval', async () => {
    useTestFakeTimers();
    expect(ADMIN_NAVIGATION_UNSEEN_REFRESH_INTERVAL).toBe(30000);

    const { result } = renderHook(() => useAdminNavigationUnseen(), { wrapper: createWrapper() });
    await act(async () => {});
    expect(result.current.counts).toEqual({ orders: 7, reviews: 3 });
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(29999);
    });
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(2);
  });

  it('retries a failed initial request after thirty seconds despite provider defaults', async () => {
    useTestFakeTimers();
    const requestError = new Error('Temporary failure');
    fetchAdminNavigationUnseen.mockRejectedValueOnce(requestError).mockResolvedValueOnce({ counts: { orders: 9, reviews: 2 }, attention: { cancellations: true } });

    const { result } = renderHook(() => useAdminNavigationUnseen(), { wrapper: createWrapper() });
    await act(async () => {});
    expect(result.current.error).toBe(requestError);
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(29999);
    });
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(2);
    expect(result.current.counts).toEqual({ orders: 9, reviews: 2 });
  });
});

describe('newestCreatedAt', () => {
  it('finds the newest valid timestamp without sorting or mutating records', () => {
    const records = Object.freeze([
      Object.freeze({ id: 1, created_at: 'invalid' }),
      Object.freeze({ id: 2, created_at: '2026-08-10T10:00:00.123456Z' }),
      Object.freeze({ id: 3 }),
      Object.freeze({ id: 4, created_at: '2026-08-11T12:30:40.789123Z' }),
    ]);

    expect(newestCreatedAt(records)).toBe('2026-08-11T12:30:40.789Z');
    expect(records.map((record) => record.id)).toEqual([1, 2, 3, 4]);
  });

  it('normalizes Carbon microseconds before parsing for runtimes that reject them', () => {
    const originalParse = Date.parse;
    const parseSpy = jest.spyOn(Date, 'parse').mockImplementation((value) => (/\.\d{4,}Z$/.test(value) ? Number.NaN : originalParse(value)));

    try {
      expect(newestCreatedAt([{ created_at: '2026-08-11T12:30:40.789123Z' }])).toBe('2026-08-11T12:30:40.789Z');
      expect(parseSpy).toHaveBeenCalledWith('2026-08-11T12:30:40.789Z');
    } finally {
      parseSpy.mockRestore();
    }
  });

  it.each([[], [{ created_at: null }, { created_at: 'not-a-date' }], undefined])('returns undefined when there is no valid timestamp', (records) => {
    expect(newestCreatedAt(records)).toBeUndefined();
  });
});

describe('useMarkAdminNavigationSeen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchAdminNavigationUnseen.mockReset().mockResolvedValue({ counts: { orders: 6, reviews: 4 }, attention: { cancellations: true } });
    markAdminNavigationSeen.mockReset();
  });

  it('does nothing while disabled', async () => {
    const { rerender } = renderHook(({ enabled }) => useMarkAdminNavigationSeen('orders', { enabled, seenThrough: '2026-08-11T08:00:00.000Z' }), {
      initialProps: { enabled: false },
      wrapper: createWrapper(),
    });

    rerender({ enabled: false });
    await act(async () => {});
    expect(markAdminNavigationSeen).not.toHaveBeenCalled();
  });

  it('fires once after becoming enabled despite strict effects and rerenders', async () => {
    markAdminNavigationSeen.mockResolvedValue({ counts: { orders: 0, reviews: 4 }, attention: { cancellations: true } });
    const { rerender } = renderHook(({ enabled, seenThrough }) => useMarkAdminNavigationSeen('orders', { enabled, seenThrough }), {
      initialProps: { enabled: false, seenThrough: '2026-08-11T08:00:00.000Z' },
      wrapper: createWrapper({ strict: true }),
    });

    rerender({ enabled: true, seenThrough: '2026-08-11T08:00:00.000Z' });
    rerender({ enabled: true, seenThrough: '2026-08-11T08:00:00.000Z' });

    await waitFor(() => expect(markAdminNavigationSeen).toHaveBeenCalledTimes(1));
    expect(markAdminNavigationSeen).toHaveBeenCalledWith('orders', '2026-08-11T08:00:00.000Z');
  });

  it('optimistically clears only the target, preserves unrelated counts, then revalidates', async () => {
    const request = deferred();
    const revalidation = deferred();
    markAdminNavigationSeen.mockReturnValue(request.promise);
    fetchAdminNavigationUnseen.mockResolvedValueOnce({ counts: { orders: 6, reviews: 4 }, attention: { cancellations: true } }).mockReturnValueOnce(revalidation.promise);
    const { result, rerender } = renderHook(
      ({ enabled }) => {
        const navigation = useAdminNavigationUnseen();
        return { counts: navigation.counts, attention: navigation.attention, mark: useMarkAdminNavigationSeen('orders', { enabled }) };
      },
      {
        initialProps: { enabled: false },
        wrapper: createWrapper(),
      },
    );
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 6, reviews: 4 }));

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 0, reviews: 4 }));
    expect(result.current.attention).toEqual({ cancellations: true });

    request.resolve({ counts: { orders: 2, reviews: 9 }, attention: { cancellations: true } });
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 0, reviews: 4 }));
    expect(result.current.attention).toEqual({ cancellations: true });
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(2);

    revalidation.resolve({ counts: { orders: 1, reviews: 8 }, attention: { cancellations: true } });
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 1, reviews: 8 }));
    expect(result.current.attention).toEqual({ cancellations: true });
  });

  it('revalidates after rejection and handles the failure inside the effect', async () => {
    const request = deferred();
    markAdminNavigationSeen.mockReturnValue(request.promise);
    fetchAdminNavigationUnseen
      .mockResolvedValueOnce({ counts: { orders: 6, reviews: 4 }, attention: { cancellations: true } })
      .mockResolvedValueOnce({ counts: { orders: 8, reviews: 5 }, attention: { cancellations: true } });
    const { result, rerender } = renderHook(({ enabled }) => ({ counts: useAdminNavigationUnseen().counts, mark: useMarkAdminNavigationSeen('reviews', { enabled }) }), {
      initialProps: { enabled: false },
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 6, reviews: 4 }));

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 6, reviews: 0 }));
    request.reject(new Error('Request failed'));

    await waitFor(() => expect(result.current.counts).toEqual({ orders: 8, reviews: 5 }));
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(2);
  });

  it('discards a stale poll during a pending mutation and finishes with post-mutation truth', async () => {
    useTestFakeTimers();
    const markRequest = deferred();
    const stalePoll = deferred();
    const finalRevalidation = deferred();
    markAdminNavigationSeen.mockReturnValue(markRequest.promise);
    fetchAdminNavigationUnseen
      .mockResolvedValueOnce({ counts: { orders: 6, reviews: 4 }, attention: { cancellations: true } })
      .mockReturnValueOnce(stalePoll.promise)
      .mockReturnValueOnce(finalRevalidation.promise);
    const { result, rerender } = renderHook(({ enabled }) => ({ counts: useAdminNavigationUnseen().counts, mark: useMarkAdminNavigationSeen('orders', { enabled }) }), {
      initialProps: { enabled: false },
      wrapper: createWrapper(),
    });
    await act(async () => {});
    expect(result.current.counts).toEqual({ orders: 6, reviews: 4 });

    rerender({ enabled: true });
    await act(async () => {});
    expect(result.current.counts).toEqual({ orders: 0, reviews: 4 });

    await act(async () => {
      jest.advanceTimersByTime(30000);
    });
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(2);

    stalePoll.resolve({ counts: { orders: 7, reviews: 5 }, attention: { cancellations: true } });
    await act(async () => {});
    expect(result.current.counts).toEqual({ orders: 0, reviews: 4 });

    markRequest.resolve({ counts: { orders: 0, reviews: 4 }, attention: { cancellations: true } });
    await act(async () => {});
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(3);

    finalRevalidation.resolve({ counts: { orders: 0, reviews: 5 }, attention: { cancellations: true } });
    await act(async () => {});
    expect(result.current.counts).toEqual({ orders: 0, reviews: 5 });
  });

  it.each([
    ['reviews', 'orders'],
    ['orders', 'reviews'],
  ])('keeps both overlapping badges cleared when %s settles before %s', async (firstResource, secondResource) => {
    const ordersRequest = deferred();
    const reviewsRequest = deferred();
    const requests = { orders: ordersRequest, reviews: reviewsRequest };
    const putResults = {
      orders: { counts: { orders: 0, reviews: 4 }, attention: { cancellations: true } },
      reviews: { counts: { orders: 6, reviews: 0 }, attention: { cancellations: true } },
    };
    const finalRevalidation = deferred();
    markAdminNavigationSeen.mockImplementation((resource) => (resource === 'orders' ? ordersRequest.promise : reviewsRequest.promise));
    fetchAdminNavigationUnseen.mockResolvedValueOnce({ counts: { orders: 6, reviews: 4 }, attention: { cancellations: true } }).mockReturnValueOnce(finalRevalidation.promise);
    const { result, rerender } = renderHook(
      ({ enabled }) => ({
        counts: useAdminNavigationUnseen().counts,
        orders: useMarkAdminNavigationSeen('orders', { enabled }),
        reviews: useMarkAdminNavigationSeen('reviews', { enabled }),
      }),
      { initialProps: { enabled: false }, wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 6, reviews: 4 }));

    rerender({ enabled: true });
    await waitFor(() => expect(markAdminNavigationSeen).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 0, reviews: 0 }));

    requests[firstResource].resolve(putResults[firstResource]);
    await act(async () => {});
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(1);
    expect(result.current.counts[secondResource]).toBe(0);

    requests[secondResource].resolve(putResults[secondResource]);
    await waitFor(() => expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(2));

    finalRevalidation.resolve({ counts: { orders: 0, reviews: 0 }, attention: { cancellations: true } });
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 0, reviews: 0 }));
  });

  it.each([
    ['orders', 'reviews'],
    ['reviews', 'orders'],
  ])('keeps both resources cleared when overlapping %s rejects before %s settles', async (rejectedResource, remainingResource) => {
    const ordersRequest = deferred();
    const reviewsRequest = deferred();
    const requests = { orders: ordersRequest, reviews: reviewsRequest };
    const putResults = {
      orders: { counts: { orders: 0, reviews: 4 }, attention: { cancellations: true } },
      reviews: { counts: { orders: 6, reviews: 0 }, attention: { cancellations: true } },
    };
    const finalRevalidation = deferred();
    markAdminNavigationSeen.mockImplementation((resource) => (resource === 'orders' ? ordersRequest.promise : reviewsRequest.promise));
    fetchAdminNavigationUnseen.mockResolvedValueOnce({ counts: { orders: 6, reviews: 4 }, attention: { cancellations: true } }).mockReturnValueOnce(finalRevalidation.promise);
    const { result, rerender } = renderHook(
      ({ enabled }) => ({
        counts: useAdminNavigationUnseen().counts,
        orders: useMarkAdminNavigationSeen('orders', { enabled }),
        reviews: useMarkAdminNavigationSeen('reviews', { enabled }),
      }),
      { initialProps: { enabled: false }, wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 6, reviews: 4 }));

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 0, reviews: 0 }));

    requests[rejectedResource].reject(new Error(`${rejectedResource} PUT failed`));
    await act(async () => {});
    expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(1);
    expect(result.current.counts).toEqual({ orders: 0, reviews: 0 });

    requests[remainingResource].resolve(putResults[remainingResource]);
    await waitFor(() => expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(2));
    finalRevalidation.resolve({ counts: { orders: 7, reviews: 5 }, attention: { cancellations: true } });
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 7, reviews: 5 }));
  });

  it('keeps both resources cleared when the last overlapping PUT is stale and recovery fails', async () => {
    const ordersRequest = deferred();
    const reviewsRequest = deferred();
    markAdminNavigationSeen.mockImplementation((resource) => (resource === 'orders' ? ordersRequest.promise : reviewsRequest.promise));
    fetchAdminNavigationUnseen.mockResolvedValueOnce({ counts: { orders: 6, reviews: 4 }, attention: { cancellations: true } }).mockRejectedValueOnce(new Error('Recovery failed'));
    const { result, rerender } = renderHook(
      ({ enabled }) => {
        const navigation = useAdminNavigationUnseen();
        useMarkAdminNavigationSeen('orders', { enabled });
        useMarkAdminNavigationSeen('reviews', { enabled });
        return { counts: navigation.counts, attention: navigation.attention };
      },
      { initialProps: { enabled: false }, wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 6, reviews: 4 }));

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 0, reviews: 0 }));
    ordersRequest.resolve({ counts: { orders: 0, reviews: 4 }, attention: { cancellations: true } });
    await act(async () => {});
    reviewsRequest.resolve({ counts: { orders: 6, reviews: 0 }, attention: { cancellations: true } });

    await waitFor(() => expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(2));
    expect(result.current.counts).toEqual({ orders: 0, reviews: 0 });
    expect(result.current.attention).toEqual({ cancellations: true });
  });

  it('retires a failed overlap generation before a later poll and isolated mark', async () => {
    const ordersRequest = deferred();
    const reviewsRequest = deferred();
    const wrapper = createWrapper();
    markAdminNavigationSeen.mockImplementationOnce(() => ordersRequest.promise).mockImplementationOnce(() => reviewsRequest.promise);
    fetchAdminNavigationUnseen
      .mockResolvedValueOnce({ counts: { orders: 6, reviews: 4 }, attention: { cancellations: true } })
      .mockRejectedValueOnce(new Error('Overlap recovery failed'))
      .mockResolvedValueOnce({ counts: { orders: 9, reviews: 8 }, attention: { cancellations: true } })
      .mockRejectedValueOnce(new Error('Isolated recovery failed'));
    const first = renderHook(
      ({ enabled }) => {
        const navigation = useAdminNavigationUnseen();
        useMarkAdminNavigationSeen('orders', { enabled });
        useMarkAdminNavigationSeen('reviews', { enabled });
        return navigation;
      },
      { initialProps: { enabled: false }, wrapper },
    );
    await waitFor(() => expect(first.result.current.counts).toEqual({ orders: 6, reviews: 4 }));
    first.rerender({ enabled: true });
    await waitFor(() => expect(first.result.current.counts).toEqual({ orders: 0, reviews: 0 }));
    ordersRequest.resolve({ counts: { orders: 0, reviews: 4 }, attention: { cancellations: true } });
    reviewsRequest.resolve({ counts: { orders: 6, reviews: 0 }, attention: { cancellations: true } });
    await waitFor(() => expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(2));
    expect(first.result.current.counts).toEqual({ orders: 0, reviews: 0 });

    await act(async () => {
      await first.result.current.mutate();
    });
    expect(first.result.current.counts).toEqual({ orders: 9, reviews: 8 });
    first.unmount();

    markAdminNavigationSeen.mockResolvedValueOnce({ counts: { orders: 0, reviews: 4 }, attention: { cancellations: true } });
    const second = renderHook(
      () => {
        const navigation = useAdminNavigationUnseen();
        useMarkAdminNavigationSeen('orders');
        return navigation;
      },
      { wrapper },
    );

    await waitFor(() => expect(markAdminNavigationSeen).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(second.result.current.counts).toEqual({ orders: 0, reviews: 8 }));
    expect(second.result.current.attention).toEqual({ cancellations: true });
  });

  it('rolls back committed counts when both the PUT and recovery GET reject', async () => {
    const request = deferred();
    markAdminNavigationSeen.mockReturnValue(request.promise);
    fetchAdminNavigationUnseen.mockResolvedValueOnce({ counts: { orders: 6, reviews: 4 }, attention: { cancellations: true } }).mockRejectedValue(new Error('Recovery failed'));
    const { result, rerender, unmount } = renderHook(({ enabled }) => ({ counts: useAdminNavigationUnseen().counts, mark: useMarkAdminNavigationSeen('reviews', { enabled }) }), {
      initialProps: { enabled: false },
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 6, reviews: 4 }));

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.counts).toEqual({ orders: 6, reviews: 0 }));
    request.reject(new Error('PUT failed'));

    await waitFor(() => expect(fetchAdminNavigationUnseen).toHaveBeenCalledTimes(2));
    expect(result.current.counts).toEqual({ orders: 6, reviews: 4 });
    unmount();
  });

  it('marks each resource once when the same mounted hook changes resource', async () => {
    markAdminNavigationSeen.mockResolvedValue({ counts: { orders: 0, reviews: 0 }, attention: { cancellations: true } });
    const { rerender } = renderHook(({ resource }) => useMarkAdminNavigationSeen(resource, { enabled: true }), {
      initialProps: { resource: 'orders' },
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(markAdminNavigationSeen).toHaveBeenCalledTimes(1));

    rerender({ resource: 'orders' });
    await act(async () => {});
    expect(markAdminNavigationSeen).toHaveBeenCalledTimes(1);

    rerender({ resource: 'reviews' });
    await waitFor(() => expect(markAdminNavigationSeen).toHaveBeenCalledTimes(2));
    rerender({ resource: 'reviews' });
    await act(async () => {});

    expect(markAdminNavigationSeen.mock.calls.map(([resource]) => resource)).toEqual(['orders', 'reviews']);
  });
});
