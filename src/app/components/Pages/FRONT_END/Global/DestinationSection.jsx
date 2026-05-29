//  all cities
import React from 'react';
import DestinationSlider from '../../../sliders/DestinationSlider';
import Reveal from '@/app/components/ui/Reveal';

const DestinationSliderSection = ({ sliderTitle = '', data }) => {
  if (sliderTitle && data) {
    return (
      <Reveal as="div" className="container-page flex flex-col gap-3 pb-10 md:pb-16 lg:pb-24 productDestination">
        <h2 className="text-lg sm:text-[28px] font-medium text-[#18181b] capitalize">{sliderTitle ? sliderTitle : 'Top Destination'}</h2>
        <DestinationSlider data={data} />
      </Reveal>
    );
  }
  return;
};

export default DestinationSliderSection;
