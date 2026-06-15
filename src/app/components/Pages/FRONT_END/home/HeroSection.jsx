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
    <section className="weelp-hero-rise relative mb-24 w-full min-h-[100dvh] overflow-hidden bg-weelp-sage-wash">
      <Image src="/assets/images/home-hero-bg-new.png" alt="" fill priority sizes="100vw" className="object-cover object-[60%_50%] -z-10" />

      <div className="container-page relative z-0 flex flex-col items-start gap-6 pt-[180px] pb-24 lg:pt-[200px] lg:pb-32">
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
          className="text-[56px] leading-[0.9] tracking-tight text-weelp-ink sm:text-[72px] lg:text-[96px]"
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
          className="block text-[56px] leading-[0.9] tracking-tight sm:text-[72px] lg:text-[96px]"
          style={{ marginTop: '-40px' }}
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

        <p className="-mt-2 max-w-[28ch] text-base sm:text-lg leading-[1.4] text-weelp-ink/80">
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span className="weelp-rise-item block" style={{ '--weelp-rise-delay': '320ms' }}>
              Beach stays, marina views, and easy city plans in one place.
            </span>
          </span>
        </p>

        <div className="weelp-hero-ui-rise w-full max-w-[920px]" style={{ '--weelp-motion-delay': '400ms', marginTop: '-6px' }}>
          <HeroSearchPill />
        </div>

        <ul className="weelp-hero-ui-rise flex w-full max-w-[920px] flex-wrap items-center gap-x-12 gap-y-4 rounded-2xl bg-[#588f7a]/30 px-6 py-4" style={{ '--weelp-motion-delay': '480ms' }}>
          {TRUST_ITEMS.map(({ Icon, label, sub }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-weelp-sage-deep/70 text-white">
                <Icon className="size-[18px]" strokeWidth={1.8} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-white">{label}</span>
                <span className="text-xs text-white/85">{sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HeroSection;
