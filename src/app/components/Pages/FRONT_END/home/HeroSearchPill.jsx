'use client';

import FilterBar from './FilterBar';

const HeroSearchPill = () => {
  return (
    <div className="relative w-full max-w-[920px]">
      <div className="relative overflow-visible rounded-[28px] bg-white shadow-[0_18px_45px_-22px_rgba(18,51,71,0.25)]">
        <FilterBar appearance="pill" />
      </div>
    </div>
  );
};

export default HeroSearchPill;
