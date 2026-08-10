'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

import { addReviewHelpfulVote, getReviewHelpfulStatus, removeReviewHelpfulVote } from '@/lib/services/reviewHelpfulVotes';

function normalizeReviewId(value) {
  const reviewId = Number(value);
  return Number.isSafeInteger(reviewId) && reviewId > 0 ? reviewId : null;
}

function publicCount(review) {
  const count = Number(review?.helpfulCount);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function responseData(response) {
  return response?.data ?? response ?? {};
}

export function useReviewHelpfulVotes(reviews = []) {
  const { data: session, status } = useSession();
  const viewerId = status === 'authenticated' && session?.user?.id != null ? String(session.user.id) : null;
  const viewerToken = useMemo(() => ({ viewerId }), [viewerId]);

  const { reviewIds, reviewsById } = useMemo(() => {
    const byId = new Map();

    for (const review of reviews) {
      const reviewId = normalizeReviewId(review?.id);
      if (reviewId !== null && !byId.has(reviewId)) byId.set(reviewId, review);
    }

    return {
      reviewIds: [...byId.keys()].sort((first, second) => first - second),
      reviewsById: byId,
    };
  }, [reviews]);

  const statusKey = viewerId !== null && reviewIds.length > 0 ? ['review-helpful-status', viewerId, reviewIds] : null;
  const {
    data: statusResponse,
    error: statusError,
    isLoading: isStatusLoading,
  } = useSWR(statusKey, () => getReviewHelpfulStatus(reviewIds), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const statusReviewIds = useMemo(() => {
    const ids = responseData(statusResponse)?.review_ids;
    return new Set(Array.isArray(ids) ? ids.map(normalizeReviewId).filter((id) => id !== null) : []);
  }, [statusResponse]);
  const isStatusReady = statusKey === null || Boolean(statusResponse || statusError) || !isStatusLoading;
  const [overrideState, setOverrideState] = useState(() => ({ viewerToken: null, values: new Map() }));
  const activeOverrides = overrideState.viewerToken === viewerToken ? overrideState.values : null;

  const stateFor = useCallback(
    (review) => {
      const reviewId = normalizeReviewId(review?.id);
      const override = reviewId === null ? null : activeOverrides?.get(reviewId);

      return {
        count: override?.count ?? publicCount(review),
        isMarked: override?.isMarked ?? (viewerId !== null && reviewId !== null && statusReviewIds.has(reviewId)),
        isPending: override?.isPending ?? false,
        isStatusReady,
      };
    },
    [activeOverrides, isStatusReady, statusReviewIds, viewerId],
  );

  const setHelpful = useCallback(
    async (reviewIdValue, nextMarked) => {
      const reviewId = normalizeReviewId(reviewIdValue);
      const review = reviewId === null ? null : reviewsById.get(reviewId);
      if (!review) throw new Error('Review is unavailable.');

      const mutationViewerToken = viewerToken;
      const previous = stateFor(review);
      const optimistic = {
        count: Math.max(0, previous.count + (nextMarked ? 1 : -1)),
        isMarked: nextMarked,
        isPending: true,
      };

      setOverrideState((current) => {
        const values = current.viewerToken === mutationViewerToken ? new Map(current.values) : new Map();
        values.set(reviewId, optimistic);
        return { viewerToken: mutationViewerToken, values };
      });

      try {
        const response = await (nextMarked ? addReviewHelpfulVote(reviewId) : removeReviewHelpfulVote(reviewId));

        const payload = responseData(response);
        const serverCount = Number(payload.helpful_count);
        const reconciled = {
          count: Number.isFinite(serverCount) && serverCount >= 0 ? serverCount : optimistic.count,
          isMarked: typeof payload.viewer_has_marked_helpful === 'boolean' ? payload.viewer_has_marked_helpful : nextMarked,
          isPending: false,
        };

        setOverrideState((current) => {
          if (current.viewerToken !== mutationViewerToken) return current;
          const values = new Map(current.values);
          values.set(reviewId, reconciled);
          return { viewerToken: mutationViewerToken, values };
        });

        return response;
      } catch (error) {
        setOverrideState((current) => {
          if (current.viewerToken !== mutationViewerToken) return current;
          const values = new Map(current.values);
          values.set(reviewId, {
            count: previous.count,
            isMarked: previous.isMarked,
            isPending: false,
          });
          return { viewerToken: mutationViewerToken, values };
        });
        throw error;
      }
    },
    [reviewsById, stateFor, viewerToken],
  );

  return { stateFor, setHelpful };
}
