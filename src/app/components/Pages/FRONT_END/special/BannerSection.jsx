import React from 'react';
import { BannerSelectBox } from './bannermodules';

const bannerImage = '/assets/images/special.png';

const BannerSection = () => {
  return (
    <section className="min-h-[60vh] h-full bg-center bg-no-repeat flex items-center justify-center" style={{ backgroundImage: `url(${bannerImage})` }}>
      <div className="w-fit flex flex-col gap-2 mb-16 scale-75 sm:scale-100">
        <p className="font-medium text-white text-center sm:text-xl">Places to visit in</p>
        <h1 className="text-white font-semibold text-xl sm:text-5xl text-center">Winter Chills</h1>
        <p className="text-white sm:text-lg text-center text-wrap opacity-70">
          You&apos;ll discover everything from whisky to Harry Potter, <br /> or even some bodysnatchers, in Scotland&apos;s captivating capital.
        </p>
        <BannerSelectBox />
      </div>
    </section>
  );
};

export default BannerSection;
