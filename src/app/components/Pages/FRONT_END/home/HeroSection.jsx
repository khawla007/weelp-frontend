import Image from 'next/image';
import { Calendar, Leaf, MapPin } from 'lucide-react';

import HeroSearchPill from './HeroSearchPill';

const TRUST_ITEMS = [
  { Icon: Leaf, label: 'Handpicked stays', sub: 'Curated for calm' },
  { Icon: MapPin, label: 'Local experiences', sub: 'Authentic & unique' },
  { Icon: Calendar, label: 'Flexible bookings', sub: 'Peace of mind' },
];

const HeroSection = () => {
  return (
    <section className="weelp-hero-rise relative h-[100svh] w-full overflow-hidden bg-surface-tint">
      <Image src="/assets/images/home-hero-bg-new.png" alt="" fill priority sizes="100vw" className="object-cover object-[60%_50%] -z-10" />

      <div className="container-page relative z-0 flex h-full flex-col items-start gap-5 pt-[156px] pb-10 sm:pt-[170px] md:gap-6 md:pt-[180px] md:pb-20 lg:pt-[214px] lg:pb-32">
        <span
          className="weelp-hero-ui-rise inline-flex items-center gap-2 rounded-full border border-weelp-sage-deep/30 bg-transparent px-4 py-2 text-xs font-bold text-weelp-sage-deep"
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
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span className="weelp-rise-item block font-medium" style={{ '--weelp-rise-delay': '160ms' }}>
              Find your next
            </span>
          </span>
        </h1>

        <span
          // eslint-disable-next-line weelp/no-noncanonical-fontsize
          className="block text-[46px] leading-[0.9] tracking-tight sm:text-[72px] lg:text-[96px]"
          style={{ marginTop: '-30px' }}
        >
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span
              className="weelp-rise-item block italic font-medium text-weelp-sage-deep"
              style={{
                '--weelp-rise-delay': '240ms',
                fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
              }}
            >
              escape
            </span>
          </span>
        </span>

        <p className="-mt-2 w-fit max-w-[30ch] px-0 py-2 text-sm leading-[1.4] text-[var(--weelp-home-hero-copy)] [background:radial-gradient(ellipse_at_center,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.25)_45%,rgba(255,255,255,0)_75%)] sm:py-3 sm:text-lg">
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span className="weelp-rise-item block" style={{ '--weelp-rise-delay': '320ms' }}>
              Beach stays, marina views, and easy city plans in one place.
            </span>
          </span>
        </p>

        <div className="weelp-hero-ui-rise relative z-20 w-full max-w-[920px]" style={{ '--weelp-motion-delay': '400ms', marginTop: '-6px' }}>
          <HeroSearchPill />
        </div>

        <ul
          className="weelp-hero-ui-rise relative z-10 grid w-full max-w-[920px] grid-cols-3 gap-2 rounded-2xl bg-weelp-sage-deep/30 px-3 py-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-12 sm:gap-y-4 sm:px-6 sm:py-4"
          style={{ '--weelp-motion-delay': '480ms' }}
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
