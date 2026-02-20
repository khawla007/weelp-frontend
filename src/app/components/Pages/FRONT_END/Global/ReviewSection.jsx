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

      <div className="w-full xl:w-2/3 p-6 space-y-4">
        <TotalReviews />
        <div className="reviewSlider">
          <h2 className="text-lg sm:text-[28px] font-medium text-Nileblue top-4">Featured review</h2>
          <ReviewSlider />
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

      <div className="w-full xl:w-2/3 p-6 space-y-4">
        <TotalReviews />
        <div className="reviewSlider">
          <h2 className="text-lg sm:text-[28px] font-medium text-Nileblue top-4">Featured review</h2>
          <ReviewSlider />
        </div>
        <Accordion items={faqItems} />
      </div>
    </section>
  );
};
