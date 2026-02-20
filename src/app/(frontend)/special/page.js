import React from 'react';
import BannerSection from '@/app/components/Pages/FRONT_END/special/BannerSection';
import ProductSliderSection from '@/app/components/Pages/FRONT_END/Global/ProductSliderSection';
import SectionItenerary from '@/app/components/Pages/FRONT_END/special/SectionItenerary';
import { SpecialFilter } from '@/app/components/Pages/FRONT_END/special/SpecialFilter/Filter';
import BreakSection from '@/app/components/BreakSection';

const SpecialPage = async () => {
  return (
    <>
      <BannerSection />
      <ProductSliderSection sliderTitle={'Curated Spots'} />
      <SectionItenerary sliderTitle={"You can't miss"} />
      <BreakSection className={'mb-8 border-1'} />
      <SpecialFilter />
    </>
  );
};

export default SpecialPage;
