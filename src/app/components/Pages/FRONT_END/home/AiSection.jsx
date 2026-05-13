import Image from 'next/image';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';
import TravelBuddyWidget from '@/app/components/Home/TravelBuddyWidget';
import PersonalisedGlobe from '@/app/components/Home/PersonalisedGlobe';
import { getAllFeaturedActivities } from '@/lib/services/activites';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';

const SHARED_CARD = 'relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] ring-1 ring-[#eaeaea]';

const AiSection = async () => {
  const featuredRes = await getAllFeaturedActivities();
  const featured = Array.isArray(featuredRes) ? featuredRes : (featuredRes?.data ?? []);
  const buddyItems = featured.map((a) => mapProductToItemCard(a));

  return (
    <section className="container-page flex flex-col items-center gap-12 pb-10 lg:pb-24">
      <h2 className="text-center text-[28px] font-medium text-[#18181b]">Your AI Travel Buddy</h2>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        <TravelBuddyWidget items={buddyItems} />

        <article className={`${SHARED_CARD} group aspect-[16/10] motion-reduce:[&_[data-overlay]]:!translate-y-0 motion-reduce:[&_[data-overlay]]:!opacity-100`}>
          <Image
            src="/assets/images/AiSaveMoney.png"
            alt="AI suggesting price-aware combinations"
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            className="object-cover"
          />
          <div
            data-overlay
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent p-4 opacity-100 transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-full group-hover:opacity-0 md:p-6"
          >
            <h3 className="text-[18px] font-semibold text-white">Save Money</h3>
            <p className="text-[16px] font-medium text-white/85">Find exclusive travel deals.</p>
          </div>
        </article>

        <article
          data-personalised-card
          className={`${SHARED_CARD} group aspect-[32/10] lg:col-span-2 lg:aspect-auto lg:min-h-[440px] motion-reduce:[&_[data-overlay]]:!translate-y-0 motion-reduce:[&_[data-overlay]]:!opacity-100`}
        >
          {/* Dotted globe — bottom-anchored and clipped by the card. */}
          <PersonalisedGlobe />
          {/* Left-edge dark fade keeps the text readable without washing out the globe. */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black via-black/70 to-transparent" />
          {/* Text — bottom-left inside the card, slides down + fades on hover */}
          <div
            data-overlay
            className="pointer-events-none absolute bottom-0 left-0 translate-y-0 p-4 opacity-100 transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-full group-hover:opacity-0 md:p-6"
          >
            <h3 className="text-[18px] font-semibold text-white">Personalised for you</h3>
            <p className="text-[16px] font-medium text-white/85">Tailored recommendations.</p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default AiSection;
