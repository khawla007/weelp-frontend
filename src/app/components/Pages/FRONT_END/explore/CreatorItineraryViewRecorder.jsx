'use client';

import { useEffect, useRef } from 'react';
import { recordItineraryView } from '@/lib/actions/creatorItineraries';

export default function CreatorItineraryViewRecorder({ itineraryId, enabled = false }) {
  const recordingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !itineraryId || recordingRef.current) return;

    const storageKey = `weelp:creator-itinerary-opened:${itineraryId}`;
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
    } catch {
      // Storage is optional; the backend throttle still protects the endpoint.
    }

    recordingRef.current = true;

    recordItineraryView(itineraryId)
      .then((result) => {
        if (!result.success) {
          recordingRef.current = false;
          return;
        }

        try {
          window.sessionStorage.setItem(storageKey, '1');
        } catch {
          // Non-blocking.
        }
      })
      .catch(() => {
        recordingRef.current = false;
      });
  }, [enabled, itineraryId]);

  return null;
}
