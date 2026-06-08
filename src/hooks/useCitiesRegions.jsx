'use client';
import { useEffect, useState } from 'react';
import { getCitiesRegions } from '@/lib/services/global';

/**
 * Fetch the shared cities/regions list once on mount.
 * Returns the unwrapped array plus a loading flag so consumers
 * can avoid rendering misleading empty-state copy during the in-flight window.
 * @returns {{ data: Array, loading: boolean }}
 */
export function useCitiesRegions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getCitiesRegions()
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response) ? response : (response?.data ?? []);
        setData(list);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Error fetching cities/regions:', error);
        setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
}
