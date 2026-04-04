'use client';

import { useEffect } from 'react';

export default function AffiliateTracker({ creatorId }) {
  useEffect(() => {
    if (creatorId) {
      localStorage.setItem('affiliate_ref', creatorId);
    }
  }, [creatorId]);

  return null;
}
