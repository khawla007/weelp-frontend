import AnimatedGlobe from '@/app/components/ui/AnimatedGlobe';
import ToursFilterBar from './ToursFilterBar';

export default function ToursHero() {
  return (
    <section className="relative z-50 min-h-[320px] sm:min-h-[420px] flex justify-center items-center bg-[#f8faf9] p-6">
      <div data-tours-globe-background className="hidden 2xl:block absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <AnimatedGlobe
          activationMediaQuery="(min-width: 1536px)"
          stageClassName="bg-transparent"
          shellClassName="bottom-[-180px] right-[-120px] z-[3] size-[760px] translate-x-0 translate-y-[40%] 2xl:size-[880px]"
          showLeftSparkles={false}
          showVignette={false}
        />
      </div>
      <div className="w-full max-w-xl sm:max-w-3xl flex flex-col items-center gap-2 relative z-[60]">
        <h1 className="text-xl sm:text-5xl font-semibold text-[#18181b] text-center">Plan your Holiday.</h1>
        <p className="max-w-xl text-sm sm:text-lg font-medium text-[#435a67] text-center">
          You&apos;ll discover everything from whisky to Harry Potter, or even some bodysnatchers, in Scotland&apos;s captivating capital.
        </p>
        <div className="mt-2 w-full">
          <ToursFilterBar />
        </div>
      </div>
    </section>
  );
}
