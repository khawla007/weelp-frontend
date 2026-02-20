import BookingForm from '@/app/components/Form/Form';
import React from 'react';
const BannerSection = () => {
  return (
    <section className="relative min-h-[320px] sm:min-h-[420px] h-full flex justify-center items-center bg-[#F5F9FA] p-6">
      <div className="max-w-xl w-full flex flex-col items-center gap-2">
        <h1 className="text-xl sm:text-5xl font-semibold text-[#143042] text-center">Plan your Holiday.</h1>
        <p className="text-sm sm:text-lg font-medium text-grayDark text-center">
          You&apos;ll discover everything from whisky to Harry Potter, or even some bodysnatchers, in Scotland&apos;s captivating capital.
        </p>
        <div className={`mt-2`}>
          <BookingForm />
        </div>
        <img alt="bannerlogo" className="hidden 2xl:block absolute -top-8 right-0 scale-90" src="/assets/Group5.png" />
      </div>
    </section>
  );
};

export default BannerSection;
