//  all cities
import React from 'react';
import DestinationSlider from '../../../sliders/DestinationSlider';

const DestinationSliderSection = ({ sliderTitle = '', data }) => {
  if (sliderTitle && data) {
    return (
      <div className="container mx-auto flex flex-col gap-3 p-4 sm:my-4 my-10 productDestination">
        <h2 className="text-lg sm:text-[28px] font-medium text-Nileblue capitalize">{sliderTitle ? sliderTitle : 'Top Destination'}</h2>
        <DestinationSlider data={data} />
      </div>
    );
  }
  return;
};

export default DestinationSliderSection;
