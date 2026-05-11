import Image from 'next/image';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';

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
          <div className="relative mt-auto aspect-[4/3] w-full">
            <Image
              src="/assets/images/AiChatassistant.png"
              alt="AI chat assistant suggesting off-beat places"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              className="object-cover"
            />
          </div>
        </article>

        <article className={SHARED_CARD}>
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="/assets/images/AiSuggestionMap.png"
              alt="AI map with suggested stops"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              className="object-cover"
            />
          </div>
          <CardCopy title="Suggestions on Map" body="See your trip mapped out." className="p-6" />
        </article>

        <article className={SHARED_CARD}>
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="/assets/images/AiSaveMoney.png"
              alt="AI suggesting price-aware combinations"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              className="object-cover"
            />
          </div>
          <CardCopy title="Save Money" body="Find exclusive travel deals." className="p-6" />
        </article>

        <article className={`${SHARED_CARD} lg:col-span-2`}>
          <div className="relative aspect-[21/9] w-full">
            <Image
              src="/assets/images/AiPersonalised.png"
              alt="AI personalised travel planning"
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              className="object-cover"
            />
          </div>
          <CardCopy title="Personalised for you" body="Tailored recommendations." className="p-6" />
        </article>
      </div>
    </section>
  );
};

export default AiSection;
