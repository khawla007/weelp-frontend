import AnimatedGlobe from '@/app/components/ui/AnimatedGlobe';
import BookingForm from '@/app/components/Form/Form';
import React from 'react';
import Reveal from '@/app/components/ui/Reveal';
const BannerSection = () => {
  return (
    <Reveal as="section" scale duration={700} className="relative min-h-[320px] sm:min-h-[420px] h-full flex justify-center items-center bg-[#f8faf9] p-6">
      <div data-holiday-globe-background className="hidden 2xl:block absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <AnimatedGlobe
          activationMediaQuery="(min-width: 1536px)"
          stageClassName="bg-transparent"
          shellClassName="bottom-[-180px] right-[-120px] z-[3] size-[760px] translate-x-0 translate-y-[40%] 2xl:size-[880px]"
          showLeftSparkles={false}
          showVignette={false}
        />
      </div>
      <div className="max-w-xl w-full flex flex-col items-center gap-2 relative z-[60]">
        <h1 className="text-xl sm:text-5xl font-semibold text-[#18181b] text-center">Plan your Holiday.</h1>
        <p className="text-sm sm:text-lg font-medium text-[#435a67] text-center">
          You&apos;ll discover everything from whisky to Harry Potter, or even some bodysnatchers, in Scotland&apos;s captivating capital.
        </p>
        <div className="mt-2 w-full [&_.bannerForm]:pt-0 [&_.bannerForm]:sm:pt-0">
          <BookingForm />
        </div>
      </div>
    </Reveal>
  );
};

export default BannerSection;
