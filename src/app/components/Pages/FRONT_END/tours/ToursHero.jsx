import ToursFilterBar from './ToursFilterBar';

export default function ToursHero() {
  return (
    <section className="relative z-50 min-h-[320px] sm:min-h-[420px] flex justify-center items-center bg-[#F5F9FA] p-6">
      <div className="hidden 2xl:block absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <img alt="" className="absolute -top-8 right-0 scale-90" src="/assets/Group5.png" />
      </div>
      <div className="w-full max-w-xl sm:max-w-3xl flex flex-col items-center gap-2 relative z-[60]">
        <h1
          className="text-xl sm:text-5xl font-semibold text-[#143042] text-center"
          style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
        >
          Plan your Holiday.
        </h1>
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
