'use client';

import Image from 'next/image';
import BuddyChat from './BuddyChat';
import TravelBuddyMap from './TravelBuddyMapClient';
import useBuddyChat from '@/hooks/useBuddyChat';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';

const SHARED_CARD = 'relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] ring-1 ring-[#eaeaea]';

const TravelBuddyWidget = () => {
  const { messages, isThinking, sendMessage, presets, lastPayload } = useBuddyChat();
  const isInitial = messages.length === 0;

  return (
    <>
      <article className={`${SHARED_CARD} lg:row-span-2`}>
        <div className="flex min-h-[360px] flex-1 flex-col">
          <BuddyChat messages={messages} isThinking={isThinking} sendMessage={sendMessage} presets={presets} />
        </div>

        <div className="h-px w-full bg-[#eaeaea]" />

        <div className="flex flex-col gap-5 p-3 md:p-6">
          <div className="rounded-lg bg-zinc-50 px-4 py-3 text-[14px] font-medium text-[#18181b]">@Buddy! Suggests best off-beat places for goa!</div>
          <button type="button" className="inline-flex w-fit items-center justify-center rounded-lg bg-[#588f7a] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#4d8069]">
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

      <article className={`${SHARED_CARD} group motion-reduce:[&_[data-overlay]]:!translate-y-0 motion-reduce:[&_[data-overlay]]:!opacity-100 md:aspect-[16/10]`}>
        <div className="relative h-full min-h-[280px] w-full overflow-hidden">
          <TravelBuddyMap markers={lastPayload.markers} route={lastPayload.route} fitBounds={lastPayload.fitBounds} showPreview={isInitial} />
          <div
            data-overlay
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent p-4 opacity-100 transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-full group-hover:opacity-0 md:p-6"
          >
            <h3 className="text-[18px] font-semibold text-white">Suggestions on Map</h3>
            <p className="text-[16px] font-medium text-white/85">See your trip mapped out.</p>
          </div>
        </div>
      </article>
    </>
  );
};

export default TravelBuddyWidget;
