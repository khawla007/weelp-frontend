'use client';

import FilterBar from './FilterBar';

const HeroSection = () => {
  return (
    <section
      className="relative w-full flex items-center justify-center"
      style={{
        backgroundImage: 'url(/assets/images/hero_illustration.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f2f7f5',
        height: '615px',
      }}
    >
      {/* Centered content */}
      <div className="relative z-0 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl mx-auto">
        <h1
          className="mb-3 font-degular"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: '#18181b',
          }}
        >
          The cities, picked. The days, planned.
        </h1>
        <p
          className="mb-8 text-[20px] sm:text-[24px] max-w-[44ch]"
          style={{
            fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
            fontWeight: 500,
            color: '#667085',
            lineHeight: 1.4,
          }}
        >
          Pick a city to begin. Independent guides shape every itinerary; you arrive ready, not lost.
        </p>
        <FilterBar />
      </div>
    </section>
  );
};

export default HeroSection;
