'use client';
import React from 'react';
import { SearchFormBlogs, SearchFormCreator } from '@/app/components/Form/SearchForm';
import { usePathname } from 'next/navigation';
import AnimatedGlobe from '@/app/components/ui/AnimatedGlobe';

/** This section handle Creator / Blogs  */
const BannerSectionSearchForm = ({ title, description }) => {
  const pathName = usePathname();
  const isExploreCreators = pathName == '/explore-creators';

  if (title && description) {
    return (
      <section className="relative overflow-hidden min-h-[320px] sm:min-h-[420px] h-full flex justify-center items-center bg-[#f8faf9] p-6 mb-10 md:mb-16 lg:mb-24">
        {isExploreCreators ? (
          <div data-explore-creators-globe-background className="hidden 2xl:block absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <AnimatedGlobe
              activationMediaQuery="(min-width: 1536px)"
              stageClassName="bg-transparent"
              shellClassName="bottom-[-180px] right-[-120px] z-[3] size-[760px] translate-x-0 translate-y-[40%] 2xl:size-[880px]"
              showLeftSparkles={false}
              showVignette={false}
            />
          </div>
        ) : null}
        <div className="max-w-xl w-full flex flex-col justify-center items-center gap-2 relative z-[60]">
          <h1 className="text-xl sm:text-5xl font-semibold text-[#18181b] text-center">{title}</h1>
          <p className="text-sm sm:text-lg font-medium text-[#435a67] text-center">{description}</p>
          <div className={`${isExploreCreators ? 'mt-2' : 'mt-6'} w-full`}>{pathName == '/blogs' ? <SearchFormBlogs /> : <SearchFormCreator />}</div>
        </div>
        {isExploreCreators ? null : <img alt="logo" className="hidden 2xl:block absolute -top-8 right-0 scale-90 pointer-events-none" src="/assets/Group5.png" />}
      </section>
    );
  }
  return;
};

export default BannerSectionSearchForm;
