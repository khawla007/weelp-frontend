'use client';

import BuddyChat from './BuddyChat';
import TravelBuddyMap from './TravelBuddyMapClient';
import useBuddyChat from '@/hooks/useBuddyChat';

const TravelBuddyWidget = () => {
  const { messages, isThinking, sendMessage, presets, lastPayload } = useBuddyChat();

  return (
    <div className="flex h-full min-h-[480px] flex-col-reverse md:min-h-0 md:flex-row">
      <div className="flex h-72 flex-1 border-t border-[#eaeaea] md:h-auto md:w-1/2 md:border-r md:border-t-0">
        <BuddyChat messages={messages} isThinking={isThinking} sendMessage={sendMessage} presets={presets} />
      </div>
      <div className="group relative h-56 w-full overflow-hidden md:h-auto md:w-1/2 md:flex-1">
        <TravelBuddyMap markers={lastPayload.markers} route={lastPayload.route} fitBounds={lastPayload.fitBounds} />
        <div
          data-overlay
          className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent p-6 opacity-100 transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-full group-hover:opacity-0"
        >
          <h3 className="text-[18px] font-semibold text-white">Suggestions on Map</h3>
          <p className="text-[16px] font-medium text-white/85">See your trip mapped out.</p>
        </div>
      </div>
    </div>
  );
};

export default TravelBuddyWidget;
