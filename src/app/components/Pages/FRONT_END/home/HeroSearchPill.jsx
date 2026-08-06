'use client';

import { HomeActivityItinerarySearch } from '../shared/ActivityItinerarySearch';

const HeroSearchPill = () => {
  return (
    <div className="relative w-full max-w-[920px]">
      <div className="relative overflow-visible rounded-[24px] bg-background p-[0.9rem] shadow-[0_18px_45px_-22px_rgba(18,51,71,0.25)] dark:shadow-none sm:rounded-[28px] sm:p-0">
        <HomeActivityItinerarySearch />
      </div>
    </div>
  );
};

export default HeroSearchPill;
