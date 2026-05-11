import Image from 'next/image';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';
import TravelBuddyWidget from '@/app/components/Home/TravelBuddyWidget';

const SHARED_CARD = 'relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] ring-1 ring-[#eaeaea]';

const CardCopy = ({ title, body, className = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <h3 className="text-[18px] font-semibold text-[#18181b]">{title}</h3>
    <p className="text-[16px] font-medium text-[#52525b]">{body}</p>
  </div>
);

const AiSection = () => {
  return (
    <section className="container-page flex flex-col items-center gap-12 pb-24 md:pb-28 lg:pb-32">
      <h2 className="text-center text-[28px] font-medium text-[#18181b]">Your AI Travel Buddy</h2>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        <article className={`${SHARED_CARD} lg:row-span-2`}>
          <div className="flex flex-col gap-1 p-6">
            <h3 className="text-[18px] font-semibold text-[#18181b]">AI Chat Assistant</h3>
            <p className="text-[16px] font-medium text-[#52525b]">Discover unique travel spots.</p>
          </div>
          <div className="h-px w-full bg-[#eaeaea]" />
          <div className="flex flex-col gap-5 p-6">
            <div className="rounded-lg bg-zinc-50 px-4 py-3 text-[14px] font-medium text-[#18181b]">@Buddy! Suggests best off-beat places for goa!</div>
            <button
              type="button"
              className="inline-flex w-fit items-center justify-center rounded-lg bg-[#588f7a] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#4d8069]"
            >
              Start Setup
            </button>
          </div>
          <div className="relative mt-auto grid aspect-[4/3] w-full grid-cols-2 gap-2 p-4">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="/assets/images/AiCityLiberty.png"
                alt="Featured destination — New York"
                fill
                sizes="(max-width: 1024px) 50vw, 16vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                className="object-cover"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="/assets/images/AiCityBigBen.png"
                alt="Featured destination — London"
                fill
                sizes="(max-width: 1024px) 50vw, 16vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                className="object-cover"
              />
            </div>
          </div>
        </article>

        <article className={`${SHARED_CARD} motion-reduce:[&_[data-overlay]]:!translate-y-0 motion-reduce:[&_[data-overlay]]:!opacity-100 md:aspect-[16/10]`}>
          <TravelBuddyWidget />
        </article>

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
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent p-6 opacity-100 transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-full group-hover:opacity-0"
          >
            <h3 className="text-[18px] font-semibold text-white">Save Money</h3>
            <p className="text-[16px] font-medium text-white/85">Find exclusive travel deals.</p>
          </div>
        </article>

        <article className={`${SHARED_CARD} lg:col-span-2`}>
          <div className="relative aspect-[21/9] w-full overflow-hidden">
            <Image
              src="/assets/images/AiPersonalised.png"
              alt="AI personalised travel planning"
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              className="object-cover"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-[8%] top-1/2 aspect-square h-[110%] -translate-y-1/2 will-change-transform [transform:translateY(-50%)_translateZ(0)]"
            >
              <span className="absolute inset-0 animate-spin rounded-full border border-dashed border-[#588f7a]/25 [animation-duration:60s] [animation-timing-function:linear] motion-reduce:animate-none" />
              <span className="absolute inset-[12%] animate-spin rounded-full border border-dotted border-[#588f7a]/15 [animation-direction:reverse] [animation-duration:90s] [animation-timing-function:linear] motion-reduce:animate-none" />
              <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 motion-reduce:hidden">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#588f7a]/30 [animation-duration:2400ms]" />
              </span>
            </span>
          </div>
          <CardCopy title="Personalised for you" body="Tailored recommendations." className="p-6" />
        </article>
      </div>
    </section>
  );
};

export default AiSection;
