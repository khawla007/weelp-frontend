'use client';
import React from 'react';
import { SearchFormBlogs, SearchFormCreator } from '@/app/components/Form/SearchForm';
import { usePathname } from 'next/navigation';
import AnimatedGlobe from '@/app/components/ui/AnimatedGlobe';

/** This section handle Creator / Blogs  */
const BannerSectionSearchForm = ({ title, description }) => {
  const pathName = usePathname();

  if (title && description) {
    return (
      <section className="weelp-hero-rise relative z-20 min-h-[320px] sm:min-h-[420px] h-full flex justify-center items-center overflow-visible bg-surface-tint p-6 mb-10 md:mb-16 lg:mb-24">
        <div data-banner-globe-background className="hidden 2xl:block absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <AnimatedGlobe
            activationMediaQuery="(min-width: 1536px)"
            stageClassName="bg-transparent"
            shellClassName="bottom-[-180px] right-[-120px] z-[3] size-[760px] translate-x-0 translate-y-[40%] 2xl:size-[880px]"
            showLeftSparkles={false}
            showVignette={false}
          />
        </div>
        <div className="w-full max-w-xl sm:max-w-3xl flex flex-col items-center gap-2 relative z-[60]">
          <h1 className="text-xl sm:text-5xl font-semibold text-foreground text-center">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
                {title}
              </span>
            </span>
          </h1>
          <p className="max-w-xl text-sm sm:text-lg font-medium text-weelp-steel text-center">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>
                {description}
              </span>
            </span>
          </p>
          <div className="weelp-hero-rise mt-2 w-full" style={{ '--weelp-motion-delay': '360ms' }}>
            {pathName == '/blogs' ? <SearchFormBlogs /> : <SearchFormCreator />}
          </div>
        </div>
      </section>
    );
  }
  return;
};

export default BannerSectionSearchForm;
