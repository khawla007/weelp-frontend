import React from 'react';
import DestinationSliderSection from '../Global/DestinationSection';
import { fakeData } from '@/app/Data/ShopData';
const TrendingSection = () => {
  return (
    <section className="w-full bg-[#f8faf9] pt-10 md:pt-16 lg:pt-24 mb-10 md:mb-16 lg:mb-24">
      <DestinationSliderSection sliderTitle={'Trending Spots'} data={fakeData} />
    </section>
  );
};

export default TrendingSection;
