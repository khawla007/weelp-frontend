import React from 'react';
import { BannerSelectBox } from './bannermodules';

const bannerImage = '/assets/images/special.png';

const BannerSection = () => {
  return (
    <section className="weelp-hero-rise min-h-[60vh] h-full bg-center bg-no-repeat flex items-center justify-center mb-10 md:mb-16 lg:mb-24" style={{ backgroundImage: `url(${bannerImage})` }}>
      <div className="w-fit flex flex-col gap-2 mb-16 scale-75 sm:scale-100">
        <p className="font-medium text-white text-center sm:text-xl">
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '120ms' }}>Places to visit in</span>
          </span>
        </p>
        <h1 className="text-white font-semibold text-xl sm:text-5xl text-center">
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>Winter Chills</span>
          </span>
        </h1>
        <p className="text-white sm:text-lg text-center text-wrap opacity-70">
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>You&apos;ll discover everything from whisky to Harry Potter,</span>
          </span>
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '320ms' }}>or even some bodysnatchers, in Scotland&apos;s captivating capital.</span>
          </span>
        </p>
        <div className="weelp-hero-rise" style={{ '--weelp-motion-delay': '360ms' }}>
          <BannerSelectBox />
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
