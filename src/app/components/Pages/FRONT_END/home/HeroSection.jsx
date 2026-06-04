import FilterBar from './FilterBar';

const chips = ['Beach stays', 'Marina views', 'City plans'];

const HeroSection = () => {
  return (
    <section
      className="weelp-hero-rise relative w-full flex items-center justify-center mb-10 md:mb-16 lg:mb-24"
      style={{
        backgroundImage: 'url(/assets/images/weelp-home-hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f2f7f5',
        height: '615px',
      }}
    >
      <div className="container-page relative z-0 flex flex-col items-center justify-center text-center">
        <span className="weelp-rise-mask mb-4 inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white/85 px-4 py-2 text-xs font-bold text-[#588f7a]">
          <span className="weelp-rise-item inline-flex items-center gap-2" style={{ '--weelp-rise-delay': '120ms' }}>
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#588f7a]" />
            Plan calmer escapes
          </span>
        </span>
        <div className="relative mb-4 flex flex-col items-center">
          <h1 className="mb-2.5 text-[28px] sm:text-[38px] md:text-[48px] leading-[1.05] text-white">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>Find your next escape</span>
            </span>
          </h1>
          <p className="max-w-[44ch] text-base sm:text-lg font-medium leading-[1.4] text-white">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>Beach stays, marina views, and easy city plans in one place.</span>
            </span>
          </p>
        </div>
        <span className="weelp-hero-rise relative z-30 mb-4 inline-block" style={{ '--weelp-motion-delay': '360ms' }}>
          <FilterBar />
        </span>
        <div className="weelp-hero-rise relative z-0 flex flex-wrap items-center justify-center gap-3" style={{ '--weelp-motion-delay': '440ms' }}>
          {chips.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white/90 px-4 py-2 text-xs font-semibold text-[#18181b] transition-[transform,background-color,color] duration-[180ms] ease-[var(--weelp-ease-ui)] hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
            >
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
