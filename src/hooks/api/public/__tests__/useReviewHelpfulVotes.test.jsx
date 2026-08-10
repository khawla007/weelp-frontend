import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';

import { useReviewHelpfulVotes } from '../useReviewHelpfulVotes';
import { addReviewHelpfulVote, getReviewHelpfulStatus, removeReviewHelpfulVote } from '@/lib/services/reviewHelpfulVotes';

let sessionState = { data: { user: { id: 7 } }, status: 'authenticated' };

jest.mock('next-auth/react', () => ({
  useSession: () => sessionState,
}));

jest.mock('@/lib/services/reviewHelpfulVotes', () => ({
  addReviewHelpfulVote: jest.fn(),
  getReviewHelpfulStatus: jest.fn(),
  removeReviewHelpfulVote: jest.fn(),
}));

const reviews = [
  { id: 8, helpfulCount: 3 },
  { id: 12, helpfulCount: 1 },
];

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

function createWrapper() {
  return function Wrapper({ children }) {
    return <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>{children}</SWRConfig>;
  };
}

describe('useReviewHelpfulVotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 7 } }, status: 'authenticated' };
    getReviewHelpfulStatus.mockResolvedValue({ success: true, data: { review_ids: [] } });
    addReviewHelpfulVote.mockResolvedValue({ success: true, data: { review_id: 8, helpful_count: 4, viewer_has_marked_helpful: true } });
    removeReviewHelpfulVote.mockResolvedValue({ success: true, data: { review_id: 8, helpful_count: 2, viewer_has_marked_helpful: false } });
  });

  it('normalizes IDs and gates authenticated controls until status hydrates', async () => {
    const statusRequest = deferred();
    getReviewHelpfulStatus.mockReturnValue(statusRequest.promise);
    const input = [{ id: '12', helpfulCount: 1 }, { id: 8, helpfulCount: 3 }, { id: 8, helpfulCount: 3 }, { id: 0 }, { id: 'nope' }];
    const { result } = renderHook(() => useReviewHelpfulVotes(input), { wrapper: createWrapper() });

    expect(result.current.stateFor(input[1])).toEqual({ count: 3, isMarked: false, isPending: false, isStatusReady: false });
    expect(getReviewHelpfulStatus).toHaveBeenCalledWith([8, 12]);

    await act(async () => statusRequest.resolve({ success: true, data: { review_ids: [8] } }));

    await waitFor(() => expect(result.current.stateFor(input[1])).toEqual({ count: 3, isMarked: true, isPending: false, isStatusReady: true }));
  });

  it('enables authenticated controls with public state after status failure', async () => {
    getReviewHelpfulStatus.mockRejectedValue(new Error('Status unavailable'));
    const { result } = renderHook(() => useReviewHelpfulVotes(reviews), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.stateFor(reviews[0])).toEqual({ count: 3, isMarked: false, isPending: false, isStatusReady: true }));
  });

  it('skips status for guests and empty review lists', () => {
    sessionState = { data: null, status: 'unauthenticated' };
    const { result } = renderHook(() => useReviewHelpfulVotes(reviews), { wrapper: createWrapper() });

    expect(result.current.stateFor(reviews[0]).isStatusReady).toBe(true);
    expect(getReviewHelpfulStatus).not.toHaveBeenCalled();

    sessionState = { data: { user: { id: 7 } }, status: 'authenticated' };
    renderHook(() => useReviewHelpfulVotes([]), { wrapper: createWrapper() });
    expect(getReviewHelpfulStatus).not.toHaveBeenCalled();
  });

  it('optimistically updates, reconciles the server response, and shares duplicate state', async () => {
    const mutation = deferred();
    addReviewHelpfulVote.mockReturnValue(mutation.promise);
    const duplicate = { id: 8, helpfulCount: 3 };
    const { result } = renderHook(() => useReviewHelpfulVotes([...reviews, duplicate]), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.stateFor(reviews[0]).isStatusReady).toBe(true));

    let request;
    act(() => {
      request = result.current.setHelpful(8, true);
    });

    expect(result.current.stateFor(reviews[0])).toEqual({ count: 4, isMarked: true, isPending: true, isStatusReady: true });
    expect(result.current.stateFor(duplicate)).toEqual(result.current.stateFor(reviews[0]));

    await act(async () => mutation.resolve({ success: true, data: { review_id: 8, helpful_count: 9, viewer_has_marked_helpful: true } }));
    await act(async () => request);

    expect(result.current.stateFor(reviews[0])).toEqual({ count: 9, isMarked: true, isPending: false, isStatusReady: true });
  });

  it('rolls back the exact prior count and selection and rethrows', async () => {
    getReviewHelpfulStatus.mockResolvedValue({ success: true, data: { review_ids: [8] } });
    const failure = deferred();
    removeReviewHelpfulVote.mockReturnValue(failure.promise);
    const { result } = renderHook(() => useReviewHelpfulVotes(reviews), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.stateFor(reviews[0]).isMarked).toBe(true));

    let request;
    act(() => {
      request = result.current.setHelpful(8, false);
    });
    expect(result.current.stateFor(reviews[0])).toMatchObject({ count: 2, isMarked: false, isPending: true });

    const error = new Error('Remove failed');
    failure.reject(error);
    await act(async () => expect(request).rejects.toBe(error));

    expect(result.current.stateFor(reviews[0])).toEqual({ count: 3, isMarked: true, isPending: false, isStatusReady: true });
  });

  it('tracks concurrent mutations independently by review ID', async () => {
    const first = deferred();
    const second = deferred();
    addReviewHelpfulVote.mockImplementation((id) => (id === 8 ? first.promise : second.promise));
    const { result } = renderHook(() => useReviewHelpfulVotes(reviews), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.stateFor(reviews[0]).isStatusReady).toBe(true));

    let firstRequest;
    let secondRequest;
    act(() => {
      firstRequest = result.current.setHelpful(8, true);
      secondRequest = result.current.setHelpful(12, true);
    });

    expect(result.current.stateFor(reviews[0]).isPending).toBe(true);
    expect(result.current.stateFor(reviews[1]).isPending).toBe(true);

    await act(async () => second.resolve({ success: true, data: { review_id: 12, helpful_count: 5, viewer_has_marked_helpful: true } }));
    await act(async () => secondRequest);
    expect(result.current.stateFor(reviews[0]).isPending).toBe(true);
    expect(result.current.stateFor(reviews[1])).toMatchObject({ count: 5, isMarked: true, isPending: false });

    await act(async () => first.resolve({ success: true, data: { review_id: 8, helpful_count: 4, viewer_has_marked_helpful: true } }));
    await act(async () => firstRequest);
  });

  it('resets viewer overrides on logout', async () => {
    const { result, rerender } = renderHook(() => useReviewHelpfulVotes(reviews), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.stateFor(reviews[0]).isStatusReady).toBe(true));
    await act(async () => result.current.setHelpful(8, true));
    expect(result.current.stateFor(reviews[0]).isMarked).toBe(true);

    sessionState = { data: null, status: 'unauthenticated' };
    rerender();

    expect(result.current.stateFor(reviews[0])).toEqual({ count: 3, isMarked: false, isPending: false, isStatusReady: true });
  });

  it('isolates direct account switches and ignores a stale mutation result', async () => {
    const staleMutation = deferred();
    addReviewHelpfulVote.mockReturnValue(staleMutation.promise);
    const { result, rerender } = renderHook(() => useReviewHelpfulVotes(reviews), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.stateFor(reviews[0]).isStatusReady).toBe(true));

    let request;
    act(() => {
      request = result.current.setHelpful(8, true);
    });
    sessionState = { data: { user: { id: 9 } }, status: 'authenticated' };
    getReviewHelpfulStatus.mockResolvedValue({ success: true, data: { review_ids: [] } });
    rerender();

    expect(result.current.stateFor(reviews[0])).toMatchObject({ count: 3, isMarked: false });
    await waitFor(() => expect(result.current.stateFor(reviews[0]).isStatusReady).toBe(true));

    await act(async () => staleMutation.resolve({ success: true, data: { review_id: 8, helpful_count: 99, viewer_has_marked_helpful: true } }));
    await act(async () => request);

    expect(result.current.stateFor(reviews[0])).toEqual({ count: 3, isMarked: false, isPending: false, isStatusReady: true });
  });

  it('does not hydrate user B from user A status resolving late', async () => {
    const userAStatus = deferred();
    const userBStatus = deferred();
    getReviewHelpfulStatus.mockReturnValueOnce(userAStatus.promise).mockReturnValueOnce(userBStatus.promise);
    const { result, rerender } = renderHook(() => useReviewHelpfulVotes(reviews), { wrapper: createWrapper() });

    sessionState = { data: { user: { id: 9 } }, status: 'authenticated' };
    rerender();
    await act(async () => userBStatus.resolve({ success: true, data: { review_ids: [] } }));
    await waitFor(() => expect(result.current.stateFor(reviews[0]).isStatusReady).toBe(true));

    await act(async () => userAStatus.resolve({ success: true, data: { review_ids: [8] } }));

    expect(result.current.stateFor(reviews[0])).toEqual({ count: 3, isMarked: false, isPending: false, isStatusReady: true });
  });
});
