import React from 'react';
import DestinationSliderSection from '../Global/DestinationSection';
import { fakeData } from '@/app/Data/ShopData';
const TrendingSection = () => {
  return (
    <section className="bg-[#f8faf9] pb-4 sm:pb-16 px-4">
      <DestinationSliderSection sliderTitle={'Trending Spots'} data={fakeData} />
    </section>
  );
};

export default TrendingSection;
