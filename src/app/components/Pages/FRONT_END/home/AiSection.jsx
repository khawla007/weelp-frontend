import Image from 'next/image';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';
import TravelBuddyWidget from '@/app/components/Home/TravelBuddyWidget';
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

        <article className={`${SHARED_CARD} group aspect-[32/10] lg:col-span-2 motion-reduce:[&_[data-overlay]]:!translate-y-0 motion-reduce:[&_[data-overlay]]:!opacity-100`}>
          {/* Rotating dotted Earth — right-anchored half-globe, tilted axis (-23.5°) + vertical wobble keyframe */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[-40px] top-[8%] aspect-square h-[240%] overflow-hidden rounded-full bg-white will-change-transform [mask-image:radial-gradient(circle,black_68%,transparent_99%)] [-webkit-mask-image:radial-gradient(circle,black_68%,transparent_99%)]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-[-25%] bg-[url(/assets/images/dotted-world.svg)] [background-size:200%_100%] [background-repeat:repeat] [animation:globe-axis-rotate_40s_linear_infinite] [transform:rotate(-23.5deg)] motion-reduce:animate-none"
            />
          </span>
          {/* Sphere shading — highlight + limb darkening for 3D depth */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[-40px] top-[8%] aspect-square h-[240%] rounded-full bg-[radial-gradient(circle_at_32%_30%,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_60%)] shadow-[inset_0_0_36px_6px_rgba(255,255,255,0.55),inset_0_0_70px_12px_rgba(0,0,0,0.05)]"
          />
          {/* Orbital halo + ping — ambient motion around the sphere */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[-40px] top-[8%] aspect-square h-[240%]"
          >
            <span className="absolute inset-[2%] animate-spin rounded-full border border-dashed border-[#588f7a]/25 [animation-duration:60s] [animation-timing-function:linear] motion-reduce:animate-none" />
            <span className="absolute inset-[14%] animate-spin rounded-full border border-dotted border-[#588f7a]/15 [animation-direction:reverse] [animation-duration:90s] [animation-timing-function:linear] motion-reduce:animate-none" />
            <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 motion-reduce:hidden">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#588f7a]/30 [animation-duration:2400ms]" />
            </span>
          </span>
          {/* Left-edge white fade so the globe blends into the text area without a dark overlay */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white via-white/85 to-transparent"
          />
          {/* Text — bottom-left inside the card, slides down + fades on hover */}
          <div
            data-overlay
            className="pointer-events-none absolute bottom-0 left-0 translate-y-0 p-4 opacity-100 transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-full group-hover:opacity-0 md:p-6"
          >
            <h3 className="text-[18px] font-semibold text-[#18181b]">Personalised for you</h3>
            <p className="text-[16px] font-medium text-[#52525b]">Tailored recommendations.</p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default AiSection;
