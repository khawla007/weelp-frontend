import Image from 'next/image';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';
import TravelBuddyWidget from '@/app/components/Home/TravelBuddyWidget';
import PersonalisedGlobe from '@/app/components/Home/PersonalisedGlobe';
import { getAllFeaturedActivities } from '@/lib/services/activites';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import Reveal from '@/app/components/ui/Reveal';
import { PUBLIC_CARD_RADIUS_CLASS } from '@/app/components/ui/cardStyles';

const SHARED_CARD = `relative flex flex-col overflow-hidden bg-card shadow-[0_2px_6px_rgba(0,0,0,0.05)] ring-1 ring-border dark:shadow-none ${PUBLIC_CARD_RADIUS_CLASS}`;

const AiSection = async ({ entrance } = {}) => {
  const featuredRes = await getAllFeaturedActivities();
  const featured = Array.isArray(featuredRes) ? featuredRes : (featuredRes?.data ?? []);
  const buddyItems = featured.map((a) => mapProductToItemCard(a));
  const usesGuidedSplit = entrance === 'guided-split';
  const HeadingRoot = usesGuidedSplit ? 'h2' : Reveal;

  return (
    <Reveal
      as="section"
      initialHidden
      data-ai-travel-buddy-entrance={usesGuidedSplit ? entrance : undefined}
      className="container-page flex flex-col items-center gap-8 pb-12 md:gap-12 md:pb-16 lg:pb-24"
    >
      <HeadingRoot
        {...(usesGuidedSplit ? { 'data-ai-travel-buddy-role': 'heading' } : { variant: 'lift' })}
        as={usesGuidedSplit ? undefined : 'h2'}
        className="text-center text-[28px] font-medium text-foreground"
      >
        Your AI Travel Buddy
      </HeadingRoot>

      <div className="grid w-full grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <TravelBuddyWidget items={buddyItems} entrance={usesGuidedSplit ? entrance : undefined} />

        <article
          data-public-card="ai-savings"
          data-ai-travel-buddy-role={usesGuidedSplit ? 'savings' : undefined}
          className={`${SHARED_CARD} group aspect-[16/10] motion-reduce:[&_[data-overlay]]:!translate-y-0 motion-reduce:[&_[data-overlay]]:!opacity-100`}
        >
          <Image
            src="/assets/images/AiSaveMoney.png"
            alt="AI suggesting price-aware combinations"
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            className="object-cover transition-transform duration-500 ease-[var(--weelp-ease-out)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <div
            data-overlay
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent p-4 opacity-100 transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-full group-hover:opacity-0 md:p-6"
          >
            <h3 className="text-[18px] font-semibold text-foreground">Save Money</h3>
            <p className="text-[16px] font-medium text-foreground">Find exclusive travel deals.</p>
          </div>
        </article>

        <article
          data-public-card="ai-personalised"
          data-personalised-card
          data-ai-travel-buddy-role={usesGuidedSplit ? 'personalised' : undefined}
          className={`${SHARED_CARD} group min-h-[220px] sm:min-h-[300px] md:min-h-[360px] lg:col-span-2 lg:min-h-[440px] motion-reduce:[&_[data-overlay]]:!translate-y-0 motion-reduce:[&_[data-overlay]]:!opacity-100`}
        >
          {/* Dotted globe — bottom-anchored and clipped by the card. */}
          <PersonalisedGlobe />
          {/* Text — bottom-left inside the card, slides down + fades on hover */}
          <div data-overlay className="pointer-events-none absolute bottom-0 left-0 z-10 p-4 opacity-100 md:p-6">
            <h3 className="text-[18px] font-semibold text-weelp-hero-foreground">Personalised for you</h3>
            <p className="text-[16px] font-medium text-weelp-hero-foreground/75">Tailored recommendations.</p>
          </div>
        </article>
      </div>
    </Reveal>
  );
};

export default AiSection;
