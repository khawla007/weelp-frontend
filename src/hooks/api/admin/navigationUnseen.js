'use client';

import { useEffect, useRef } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { ADMIN_NAVIGATION_UNSEEN_KEY, fetchAdminNavigationUnseen, markAdminNavigationSeen, normalizeAdminNavigationCounts } from '@/lib/services/adminNavigationUnseen';

export const ADMIN_NAVIGATION_UNSEEN_REFRESH_INTERVAL = 30000;

const activeMutationsByCache = new WeakMap();

function retryAfterInterval(_error, _key, config, revalidate, options) {
  setTimeout(revalidate, config.errorRetryInterval, options);
}

function beginMutation(cache, resource) {
  const state = activeMutationsByCache.get(cache) ?? { active: 0, activeResources: new Set(), overlapped: false };
  state.active += 1;
  state.activeResources.add(resource);
  state.overlapped ||= state.active > 1;
  activeMutationsByCache.set(cache, state);

  return state;
}

function finishMutation(cache, state, resource) {
  state.active -= 1;
  state.activeResources.delete(resource);

  if (state.active !== 0) return false;

  activeMutationsByCache.delete(cache);
  return state.overlapped;
}

export function useAdminNavigationUnseen() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(ADMIN_NAVIGATION_UNSEEN_KEY, fetchAdminNavigationUnseen, {
    errorRetryInterval: ADMIN_NAVIGATION_UNSEEN_REFRESH_INTERVAL,
    onErrorRetry: retryAfterInterval,
    refreshInterval: ADMIN_NAVIGATION_UNSEEN_REFRESH_INTERVAL,
    shouldRetryOnError: true,
  });

  return {
    counts: normalizeAdminNavigationCounts(data),
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export function newestCreatedAt(records) {
  if (!Array.isArray(records)) return undefined;

  let newestTimestamp;

  for (const record of records) {
    const createdAt = typeof record?.created_at === 'string' ? record.created_at.replace(/(\.\d{3})\d+Z$/, '$1Z') : record?.created_at;
    const timestamp = Date.parse(createdAt);

    if (Number.isFinite(timestamp) && (newestTimestamp === undefined || timestamp > newestTimestamp)) {
      newestTimestamp = timestamp;
    }
  }

  return newestTimestamp === undefined ? undefined : new Date(newestTimestamp).toISOString();
}

export function useMarkAdminNavigationSeen(resource, { enabled = true, seenThrough } = {}) {
  const { cache, mutate } = useSWRConfig();
  const markedResourcesRef = useRef(new Set());

  useEffect(() => {
    if (!enabled || markedResourcesRef.current.has(resource)) return;

    markedResourcesRef.current.add(resource);
    const mutationState = beginMutation(cache, resource);

    const markSeen = async () => {
      try {
        await mutate(ADMIN_NAVIGATION_UNSEEN_KEY, markAdminNavigationSeen(resource, seenThrough), {
          optimisticData: (_committed, displayed) => ({
            ...normalizeAdminNavigationCounts(displayed),
            [resource]: 0,
          }),
          populateCache: (result) => {
            const counts = normalizeAdminNavigationCounts(result);

            for (const activeResource of mutationState.activeResources) {
              if (activeResource !== resource) {
                counts[activeResource] = 0;
              }
            }

            return counts;
          },
          revalidate: () => !mutationState.overlapped,
          rollbackOnError: () => !mutationState.overlapped,
        });
      } catch {
        // Isolated mutations let SWR recover; overlapped batches revalidate below.
      } finally {
        if (finishMutation(cache, mutationState, resource)) {
          await mutate(ADMIN_NAVIGATION_UNSEEN_KEY).catch(() => undefined);
        }
      }
    };

    void markSeen();
  }, [cache, enabled, mutate, resource, seenThrough]);
}
