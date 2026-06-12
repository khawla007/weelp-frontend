import Image from 'next/image';

import FilterBar from './FilterBar';

const chips = ['Beach stays', 'Marina views', 'City plans'];

const HeroSection = () => {
  return (
    <section className="weelp-hero-rise relative w-full flex items-center justify-center min-h-[calc(100dvh-94px)] lg:min-h-[calc(100dvh-112px)] mb-16 lg:mb-24 bg-weelp-sage-wash">
      <Image src="/assets/images/weelp-home-hero-v2.png" alt="" fill priority sizes="100vw" className="object-cover object-center -z-20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-weelp-ink/35 via-weelp-ink/20 to-weelp-ink/45" />
      <div className="container-page relative z-0 flex flex-col items-center justify-center text-center py-16 lg:py-20">
        <span
          className="weelp-hero-ui-rise mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur"
          style={{ '--weelp-motion-delay': '120ms' }}
        >
          <span className="inline-block h-[7px] w-[7px] rounded-full bg-weelp-sage-tint" />
          Plan calmer escapes
        </span>
        <div className="relative mb-3 flex flex-col items-center">
          <h1 className="mb-3 text-[28px] sm:text-[38px] md:text-[48px] lg:text-[52px] leading-[1.05] text-white">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
                Find your next escape
              </span>
            </span>
          </h1>
          <p className="max-w-[44ch] text-base sm:text-lg font-medium leading-[1.4] text-white/90">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>
                Beach stays, marina views, and easy city plans in one place.
              </span>
            </span>
          </p>
        </div>
        <span className="weelp-hero-ui-rise relative z-30 mb-10 inline-block" style={{ '--weelp-motion-delay': '360ms' }}>
          <FilterBar />
        </span>
        <div className="weelp-hero-ui-rise relative z-0 mt-8 flex flex-wrap items-center justify-center gap-3" style={{ '--weelp-motion-delay': '440ms' }}>
          {chips.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition-[transform,background-color,color] duration-[180ms] ease-[var(--weelp-ease-ui)] hover:-translate-y-0.5 hover:bg-white/25 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-weelp-sage-tint" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
