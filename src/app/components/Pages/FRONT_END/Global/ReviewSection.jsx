'use client';
import React from 'react';
import { WhatAboutCity, WhatAboutRegion } from '../../../WhatAbout';
import ReviewSlider from '../../../sliders/ReviewSlider';
import TotalReviews from '../../../TotalReviews';
import Accordion from '../../../Faq';
import { faqItems, destinationInfo } from '@/app/Data/ShopData'; //static data
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';
import { COMPACT_SLIDER_NAV_BUTTON_CLASS } from '@/app/components/ui/sliderNavigationClasses';

const bgImage = '/assets/images/whatabout.webp';

const destinationBgStyle = {
  backgroundImage: `url(${bgImage})`,
  backgroundSize: '100% 200px',
  backgroundPosition: 'center bottom',
  backgroundRepeat: 'no-repeat',
};

// Review Section City Page
export const ReviewSectionCity = ({ cityData, reviews = [], reviewSummary = null }) => {
  const hasReviews = reviews.length > 0;

  return (
    <section className="container-page flex flex-wrap pb-10 md:pb-16 lg:pb-24">
      {/* if values exist inoobjects */}
      {cityData?.location_details && Object.keys(cityData.location_details).length > 0 && (
        <Reveal variant="lift" className="w-full self-start bg-muted pb-[200px] xl:w-1/3" style={destinationBgStyle}>
          <WhatAboutCity location_details={cityData.location_details} />
        </Reveal>
      )}

      <Reveal variant="lift" delay={120} className="w-full space-y-6 md:p-6 xl:w-2/3">
        {hasReviews && <TotalReviews rating={reviewSummary?.average_rating} totalReviews={reviewSummary?.total_reviews} />}
        {hasReviews && (
          <div className="border border-[var(--weelp-home-border)] rounded-2xl p-4 sm:p-6 md:p-8 bg-background shadow-[8px_8px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between w-full relative min-h-[40px]">
                <h2 className="text-lg md:text-2xl lg:text-[28px] font-extrabold tracking-[-0.04em] text-[var(--weelp-home-ink)]">Top traveler reviews</h2>
                <div className="flex gap-3 items-center">
                  <button type="button" className={`review-prev ${COMPACT_SLIDER_NAV_BUTTON_CLASS}`} aria-label="Previous review">
                    <ChevronLeft className="size-[18px]" />
                  </button>
                  <button type="button" className={`review-next ${COMPACT_SLIDER_NAV_BUTTON_CLASS}`} aria-label="Next review">
                    <ChevronRight className="size-[18px]" />
                  </button>
                </div>
              </div>
              <ReviewSlider reviews={reviews} />
            </div>
          </div>
        )}
        <Accordion items={faqItems} layout="stable" />
      </Reveal>
    </section>
  );
};

// Review Section Region Page
export const ReviewSectionRegion = ({ cityData }) => {
  return (
    <section className="container-page flex flex-wrap pb-10 md:pb-16 lg:pb-24">
      <Reveal variant="lift" className="w-full self-start bg-muted pb-[200px] xl:w-1/3" style={destinationBgStyle}>
        <WhatAboutRegion destinationInfo={destinationInfo} />
      </Reveal>

      <Reveal variant="lift" delay={120} className="w-full xl:w-2/3 p-6 space-y-6">
        <TotalReviews />
        <div className="border border-[var(--weelp-home-border)] rounded-2xl p-6 sm:p-8 bg-background shadow-[8px_8px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between w-full relative min-h-[40px]">
              <h2 className="text-lg sm:text-[28px] font-extrabold tracking-[-0.04em] text-[var(--weelp-home-ink)]">Featured review</h2>
              <div className="flex gap-3 items-center">
                <button type="button" className={`review-prev ${COMPACT_SLIDER_NAV_BUTTON_CLASS}`} aria-label="Previous review">
                  <ChevronLeft className="size-[18px]" />
                </button>
                <button type="button" className={`review-next ${COMPACT_SLIDER_NAV_BUTTON_CLASS}`} aria-label="Next review">
                  <ChevronRight className="size-[18px]" />
                </button>
              </div>
            </div>
            <ReviewSlider />
          </div>
        </div>
        <Accordion items={faqItems} />
      </Reveal>
    </section>
  );
};
