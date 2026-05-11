'use client';

import dynamic from 'next/dynamic';

const TravelBuddyMap = dynamic(() => import('./TravelBuddyMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-[12px] font-medium uppercase tracking-wide text-[#52525b]">
      Loading map…
    </div>
  ),
});

const TravelBuddyMapClient = (props) => <TravelBuddyMap {...props} />;

export default TravelBuddyMapClient;
