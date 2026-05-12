'use client';

import FilterBar from './FilterBar';

const HeroSection = () => {
  return (
    <section
      className="relative w-full flex items-center justify-center mb-10 lg:mb-24"
      style={{
        backgroundImage: 'url(/assets/images/hero_illustration.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f2f7f5',
        height: '615px',
      }}
    >
      <div className="container-page relative z-0 flex flex-col items-center justify-center text-center">
        <h1 className="hero-rise mb-3 text-[28px] sm:text-[28px] md:text-[38px]">Plan and Book</h1>
        <p
          className="hero-rise mb-8 max-w-[44ch] text-[20px] font-medium leading-[1.4] text-[#71717a] sm:text-[24px]"
          style={{ '--hero-rise-delay': '120ms' }}
        >
          The best experiences around you.
        </p>
        <span className="hero-rise inline-block" style={{ '--hero-rise-delay': '240ms' }}>
          <FilterBar />
        </span>
      </div>
    </section>
  );
};

export default HeroSection;
