'use client';

import FilterBar from './FilterBar';

const chips = ['Beach stays', 'Marina views', 'City plans'];

const HeroSection = () => {
  return (
    <section
      className="relative w-full flex items-center justify-center mb-10 lg:mb-24"
      style={{
        backgroundImage: 'url(/assets/images/hero_redesigned_bg.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f2f7f5',
        height: '615px',
      }}
    >
      <div className="container-page relative z-0 flex flex-col items-center justify-center text-center">
        <div
          aria-hidden="true"
          className="hero-rise pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[222px] w-[538px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-[150px] blur-[30px]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.89) 34%, rgba(255,255,255,0.50) 72%, rgba(255,255,255,0) 100%)',
            '--hero-rise-delay': '40ms',
          }}
        />
        <span className="hero-rise mb-4 inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white/85 px-4 py-2 text-xs font-bold text-[#588f7a]">
          <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#588f7a]" />
          Plan calmer escapes
        </span>
        <div className="mb-4 flex flex-col items-center">
          <h1 className="hero-rise mb-2.5 text-[28px] sm:text-[38px] md:text-[48px] leading-[1.05] text-[#18181b]" style={{ '--hero-rise-delay': '80ms' }}>
            Find your next escape
          </h1>
          <p className="hero-rise max-w-[44ch] text-base sm:text-lg font-medium leading-[1.4] text-[#435a67]" style={{ '--hero-rise-delay': '160ms' }}>
            Beach stays, marina views, and easy city plans in one place.
          </p>
        </div>
        <span className="hero-rise mb-4 inline-block" style={{ '--hero-rise-delay': '240ms' }}>
          <FilterBar />
        </span>
        <div className="hero-rise flex flex-wrap items-center justify-center gap-3" style={{ '--hero-rise-delay': '320ms' }}>
          {chips.map((label) => (
            <span key={label} className="inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white/90 px-4 py-2 text-xs font-semibold text-[#18181b]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#588f7a]" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
