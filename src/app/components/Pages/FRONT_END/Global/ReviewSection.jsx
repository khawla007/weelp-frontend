'use client';
import React from 'react';
import { WhatAboutCity, WhatAboutRegion } from '../../../WhatAbout';
import ReviewSlider from '../../../sliders/ReviewSlider';
import TotalReviews from '../../../TotalReviews';
import Accordion from '../../../Faq';
import { faqItems, destinationInfo } from '@/app/Data/ShopData'; //static data
import { ChevronLeft, ChevronRight } from 'lucide-react';

const bgImage = '/assets/images/whatabout.webp';

const bgStyle = {
  backgroundImage: `url(${bgImage})`,
  backgroundSize: '100% 200px',
  backgroundPosition: 'bottom',
  backgroundRepeat: 'no-repeat',
  backgroundPositionY: '70%',
};

// Review Section City Page
export const ReviewSectionCity = ({ cityData, reviews = [] }) => {
  return (
    <section className="flex flex-wrap">
      {/* if values exist inoobjects */}
      {cityData?.location_details && Object.keys(cityData.location_details).length > 0 && (
        <div className="w-full xl:w-1/3 bg-[#f4f5f7]" style={bgStyle}>
          <WhatAboutCity location_details={cityData.location_details} />
        </div>
      )}

      <div className="w-full xl:w-2/3 p-4 md:p-6 space-y-6">
        <TotalReviews />
        <div className="border border-[var(--weelp-home-border)] rounded-2xl p-4 sm:p-6 md:p-8 bg-white shadow-[8px_8px_20px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between w-full relative min-h-[40px]">
              <h2 className="font-home-heading text-lg md:text-2xl lg:text-[28px] font-extrabold tracking-[-0.04em] text-[var(--weelp-home-ink)]">Featured review</h2>
              <div className="flex gap-3 items-center">
                <button type="button" className="review-prev rounded-full bg-[#F4F4F5] px-3 py-[10px] text-[#18181B] transition hover:bg-[#E4E4E7]" aria-label="Previous review">
                  <ChevronLeft className="size-[18px]" />
                </button>
                <button type="button" className="review-next rounded-full bg-[#18181B] px-3 py-[10px] text-white transition hover:bg-[#27272A]" aria-label="Next review">
                  <ChevronRight className="size-[18px]" />
                </button>
              </div>
            </div>
            <ReviewSlider reviews={reviews} />
          </div>
        </div>
        <Accordion items={faqItems} />
      </div>
    </section>
  );
};

// Review Section Region Page
export const ReviewSectionRegion = ({ cityData }) => {
  return (
    <section className="flex flex-wrap  mt-8">
      <div className="w-full xl:w-1/3 bg-[#f4f5f7]" style={bgStyle}>
        <WhatAboutRegion destinationInfo={destinationInfo} />
      </div>

      <div className="w-full xl:w-2/3 p-6 space-y-6">
        <TotalReviews />
        <div className="border border-[var(--weelp-home-border)] rounded-2xl p-6 sm:p-8 bg-white shadow-[8px_8px_20px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between w-full relative min-h-[40px]">
              <h2 className="font-home-heading text-lg sm:text-[28px] font-extrabold tracking-[-0.04em] text-[var(--weelp-home-ink)]">Featured review</h2>
              <div className="flex gap-3 items-center">
                <button type="button" className="review-prev rounded-full bg-[#F4F4F5] px-3 py-[10px] text-[#18181B] transition hover:bg-[#E4E4E7]" aria-label="Previous review">
                  <ChevronLeft className="size-[18px]" />
                </button>
                <button type="button" className="review-next rounded-full bg-[#18181B] px-3 py-[10px] text-white transition hover:bg-[#27272A]" aria-label="Next review">
                  <ChevronRight className="size-[18px]" />
                </button>
              </div>
            </div>
            <ReviewSlider />
          </div>
        </div>
        <Accordion items={faqItems} />
      </div>
    </section>
  );
};
