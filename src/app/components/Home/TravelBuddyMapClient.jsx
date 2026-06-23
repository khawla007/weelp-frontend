'use client';

import dynamic from 'next/dynamic';

const TravelBuddyMap = dynamic(() => import('./TravelBuddyMap'), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-muted text-[12px] font-medium uppercase tracking-wide text-copy">Loading map…</div>,
});

const TravelBuddyMapClient = (props) => <TravelBuddyMap {...props} />;

export default TravelBuddyMapClient;
