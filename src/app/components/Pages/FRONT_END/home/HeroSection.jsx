import { Fragment } from 'react';
import Image from 'next/image';
import { Calendar, Leaf, MapPin } from 'lucide-react';

import HeroSearchPill from './HeroSearchPill';

const TRUST_ITEMS = [
  { Icon: Leaf, label: 'Handpicked stays', sub: 'Curated for calm' },
  { Icon: MapPin, label: 'Local experiences', sub: 'Authentic & unique' },
  { Icon: Calendar, label: 'Flexible bookings', sub: 'Peace of mind' },
];

// Leave an intentional 88ms gap before the accent line begins.
const ESCAPE_CHARACTER_START_INDEX = 16;

const HeroBlurLine = ({ text, startIndex = 0, className = '' }) => {
  let characterIndex = startIndex;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" data-home-hero-visual className="weelp-home-hero-blur-visual">
        {text.split(' ').map((word, wordIndex, words) => (
          <Fragment key={`${word}-${wordIndex}`}>
            <span className="weelp-home-hero-blur-word">
              {word.split('').map((character) => {
                const currentIndex = characterIndex;
                // eslint-disable-next-line react-hooks/immutability -- render-local counter deterministically sequences static characters
                characterIndex += 1;

                return (
                  <span key={`${character}-${currentIndex}`} data-home-hero-character className="weelp-home-hero-blur-character" style={{ '--weelp-hero-character-index': currentIndex }}>
                    {character}
                  </span>
                );
              })}
            </span>
            {wordIndex < words.length - 1 ? <span className="weelp-home-hero-blur-space"> </span> : null}
          </Fragment>
        ))}
      </span>
    </span>
  );
};

const HeroSection = () => {
  return (
    <section className="weelp-hero-rise relative isolate mb-10 w-full overflow-hidden bg-surface-tint sm:mb-16 md:h-[100svh] lg:mb-24">
      <Image src="/assets/images/home-hero-bg-new.png" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[60%_50%]" />
      {/* dark-mode-exempt: requested photographic hero overlay uses white at 10 percent opacity */}
      <div aria-hidden="true" data-testid="home-hero-overlay" className="absolute inset-0 -z-10 bg-white/10" />

      <div className="container-page relative z-0 flex flex-col items-start gap-5 pb-10 pt-[135px] sm:pb-16 sm:pt-[170px] md:h-full md:gap-6 md:pb-20 md:pt-[180px] lg:pb-32 lg:pt-[214px]">
        <span
          className="weelp-home-hero-eyebrow weelp-hero-ui-rise inline-flex items-center gap-2 rounded-full border border-weelp-sage-deep/30 bg-transparent px-4 py-2 text-xs font-bold text-[var(--weelp-home-hero-accent)]"
          style={{ '--weelp-motion-delay': '80ms' }}
        >
          <Leaf className="size-[14px]" strokeWidth={2} />
          Plan calmer escapes
        </span>

        {/* eslint-disable-next-line weelp/no-inline-heading-font */}
        <h1
          // eslint-disable-next-line weelp/no-noncanonical-fontsize
          className="text-[46px] leading-[0.9] tracking-tight text-[var(--weelp-home-hero-ink)] sm:text-[72px] lg:text-[96px]"
          style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
        >
          <HeroBlurLine text="Find your next" className="block font-medium" />
        </h1>

        <span
          // eslint-disable-next-line weelp/no-noncanonical-fontsize
          className="block text-[46px] leading-[0.9] tracking-tight sm:text-[72px] lg:text-[96px]"
          style={{ marginTop: '-30px', fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif' }}
        >
          <HeroBlurLine text="escape" startIndex={ESCAPE_CHARACTER_START_INDEX} className="block italic font-medium text-[var(--weelp-home-hero-accent)]" />
        </span>

        <p
          className="weelp-hero-ui-rise -mt-2 relative isolate w-fit max-w-[30ch] px-0 py-2 text-sm leading-[1.4] text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.5)] before:absolute before:-inset-x-5 before:-inset-y-3 before:-z-10 before:rounded-full before:bg-[var(--weelp-hero-subtitle-shade)] before:blur-2xl before:content-[''] sm:py-3 sm:text-lg sm:text-[var(--weelp-home-hero-copy)] sm:[background:radial-gradient(ellipse_at_center,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.25)_45%,rgba(255,255,255,0)_75%)] sm:[text-shadow:none] sm:before:hidden"
          style={{ '--weelp-motion-delay': '560ms', '--weelp-hero-subtitle-shade': 'rgba(0, 0, 0, 0.35)' }}
        >
          <span className="weelp-rise-mask weelp-rise-mask--block">Beach stays, marina views, and easy city plans in one place.</span>
        </p>

        <div className="weelp-hero-ui-rise relative z-20 w-full max-w-[920px]" style={{ '--weelp-motion-delay': '700ms', marginTop: '-6px' }}>
          <HeroSearchPill />
        </div>

        <ul
          className="weelp-hero-ui-rise relative z-10 grid w-full max-w-[920px] grid-cols-3 gap-2 rounded-2xl bg-weelp-sage-deep/30 px-3 py-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-12 sm:gap-y-4 sm:px-6 sm:py-4"
          style={{ '--weelp-motion-delay': '840ms' }}
        >
          {TRUST_ITEMS.map(({ Icon, label, sub }) => (
            <li key={label} className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:text-left sm:gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-weelp-sage-deep/70 text-white sm:h-10 sm:w-10">
                <Icon className="size-4 sm:size-[18px]" strokeWidth={1.8} />
              </span>
              <span className="flex min-w-0 flex-col leading-tight text-white">
                <span className="text-xs font-semibold leading-tight text-white sm:text-sm">{label}</span>
                <span className="hidden text-xs text-white/85 sm:block">{sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HeroSection;
