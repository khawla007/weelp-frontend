'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import BuddyChat from './BuddyChat';
import TravelBuddyMap from './TravelBuddyMapClient';
import CarouselShell from '@/app/components/ui/CarouselShell';
import ItemCard from '@/app/components/ui/item-card';
import { COMPACT_SLIDER_NAV_BUTTON_CLASS } from '@/app/components/ui/sliderNavigationClasses';
import useBuddyChat from '@/hooks/useBuddyChat';
import { PUBLIC_CARD_RADIUS_CLASS } from '@/app/components/ui/cardStyles';

const SHARED_CARD = `relative flex flex-col overflow-hidden bg-card shadow-sm ring-1 ring-border dark:shadow-none ${PUBLIC_CARD_RADIUS_CLASS}`;

const BUDDY_SLIDER_BREAKPOINTS = {
  0: { slidesPerView: 1, spaceBetween: 12 },
};

const TravelBuddyWidget = ({ items = [], entrance }) => {
  const { messages, isThinking, sendMessage, presets, lastPayload } = useBuddyChat();
  const isInitial = messages.length === 0;
  const hasItems = items.length > 0;
  const usesGuidedSplit = entrance === 'guided-split';

  return (
    <>
      <article data-public-card="ai-chat" data-ai-travel-buddy-role={usesGuidedSplit ? 'chat' : undefined} className={`${SHARED_CARD} lg:row-span-2`}>
        <div className="flex h-[300px] shrink-0 flex-col md:h-[360px]">
          <BuddyChat messages={messages} isThinking={isThinking} sendMessage={sendMessage} presets={presets} />
        </div>

        {hasItems && (
          <>
            <div className="h-px w-full bg-border" />

            <div className="flex flex-col gap-3 p-3 md:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-foreground">Featured activities</h3>
                <div className="flex items-center gap-2">
                  <button type="button" className={`buddy-activities-prev ${COMPACT_SLIDER_NAV_BUTTON_CLASS}`} aria-label="Previous featured activities">
                    <ChevronLeft className="size-4" />
                  </button>
                  <button type="button" className={`buddy-activities-next ${COMPACT_SLIDER_NAV_BUTTON_CLASS}`} aria-label="Next featured activities">
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              <CarouselShell
                items={items}
                navigationPrefix="buddy-activities"
                breakpoints={BUDDY_SLIDER_BREAKPOINTS}
                slideClassName="!h-auto"
                renderSlide={(card) => <ItemCard {...card} variant="full" />}
              />
            </div>
          </>
        )}
      </article>

      <article
        data-public-card="ai-map"
        data-ai-travel-buddy-role={usesGuidedSplit ? 'map' : undefined}
        className={`${SHARED_CARD} group motion-reduce:[&_[data-overlay]]:!translate-y-0 motion-reduce:[&_[data-overlay]]:!opacity-100 md:aspect-[16/10]`}
      >
        <div className="relative h-full min-h-[220px] w-full overflow-hidden md:min-h-[280px]">
          <TravelBuddyMap markers={lastPayload.markers} route={lastPayload.route} fitBounds={lastPayload.fitBounds} showPreview={isInitial} />
          <div
            data-overlay
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent p-4 opacity-100 transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-full group-hover:opacity-0 md:p-6"
          >
            <h3 className="text-[18px] font-semibold text-foreground">Suggestions on Map</h3>
            <p className="text-[16px] font-medium text-foreground">See your trip mapped out.</p>
          </div>
        </div>
      </article>
    </>
  );
};

export default TravelBuddyWidget;
