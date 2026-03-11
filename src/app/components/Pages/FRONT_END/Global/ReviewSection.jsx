'use client';
import React from 'react';
import { WhatAboutCity, WhatAboutRegion } from '../../../WhatAbout';
import ReviewSlider from '../../../sliders/ReviewSlider';
import TotalReviews from '../../../TotalReviews';
import Accordion from '../../../Faq';
import { faqItems, destinationInfo } from '@/app/Data/ShopData'; //static data

const bgImage = '/assets/images/whatabout.png';

const bgStyle = {
  backgroundImage: `url(${bgImage})`,
  backgroundSize: '100% 200px',
  backgroundPosition: 'bottom',
  backgroundRepeat: 'no-repeat',
  backgroundPositionY: '70%',
};

// Review Section City Page
export const ReviewSectionCity = ({ cityData }) => {
  return (
    <section className="flex flex-wrap mt-8">
      {/* if values exist inoobjects */}
      {cityData?.location_details && Object.keys(cityData.location_details).length > 0 && (
        <div className="w-full xl:w-1/3 bg-[#f4f5f7]" style={bgStyle}>
          <WhatAboutCity location_details={cityData.location_details} />
        </div>
      )}

      <div className="w-full xl:w-2/3 p-6 space-y-6">
        <TotalReviews />
        <div className="border border-gray-100 rounded-2xl p-6 sm:p-8 bg-white shadow-[8px_8px_20px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between w-full relative min-h-[40px]">
              <h2 className="text-lg sm:text-[28px] font-medium text-Nileblue">Featured review</h2>
              <div className="flex gap-3 items-center">
                <div className="review-prev swiper-button-prev !static !m-0 after:!text-[14px]"></div>
                <div className="review-next swiper-button-next !static !m-0 after:!text-[14px]"></div>
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

// Review Section Region Page
export const ReviewSectionRegion = ({ cityData }) => {
  return (
    <section className="flex flex-wrap  mt-8">
      <div className="w-full xl:w-1/3 bg-[#f4f5f7]" style={bgStyle}>
        <WhatAboutRegion destinationInfo={destinationInfo} />
      </div>

      <div className="w-full xl:w-2/3 p-6 space-y-6">
        <TotalReviews />
        <div className="border border-gray-100 rounded-2xl p-6 sm:p-8 bg-white shadow-[8px_8px_20px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between w-full relative min-h-[40px]">
              <h2 className="text-lg sm:text-[28px] font-medium text-Nileblue">Featured review</h2>
              <div className="flex gap-3 items-center">
                <div className="review-prev swiper-button-prev !static !m-0 after:!text-[14px]"></div>
                <div className="review-next swiper-button-next !static !m-0 after:!text-[14px]"></div>
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
