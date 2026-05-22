import React from 'react';
import ProductSlider from '../../../sliders/ProductSlider';

// sliders
const ProductSliderSection = ({ sliderTitle, destinations = [] }) => {
  return (
    <section className="container-page flex flex-col gap-3 pb-10 md:pb-16 lg:pb-24 productSlider">
      <h2 className="text-lg sm:text-[28px] font-medium text-[#18181b] top-4 capitalize">{sliderTitle || 'Top activities'}</h2>

      {/* Check Items */}
      {destinations && destinations.length > 0 && <ProductSlider data={destinations} />}
    </section>
  );
};

export default ProductSliderSection;
