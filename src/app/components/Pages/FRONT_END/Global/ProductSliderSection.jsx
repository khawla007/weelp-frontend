import React from 'react';
import ProductSlider from '../../../sliders/ProductSlider';

// sliders
const ProductSliderSection = ({ sliderTitle, destinations = [] }) => {
  return (
    <section className="container mx-auto flex flex-col gap-3 p-4 sm:my-10 productSlider">
      <h2 className="text-lg sm:text-[28px] font-medium text-Nileblue top-4 capitalize">{sliderTitle || 'Top activities'}</h2>

      {/* Check Items */}
      {destinations && destinations.length > 0 && <ProductSlider data={destinations} />}
    </section>
  );
};

export default ProductSliderSection;
