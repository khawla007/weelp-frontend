import React from 'react';
import ProductSlider from '../../../sliders/ProductSlider';
import Reveal from '@/app/components/ui/Reveal';

// sliders
const ProductSliderSection = ({ sliderTitle, destinations = [] }) => {
  return (
    <Reveal as="section" initialHidden className="container-page flex flex-col gap-3 pb-10 md:pb-16 lg:pb-24 productSlider">
      <Reveal as="h2" variant="lift" className="text-lg sm:text-[28px] font-medium text-foreground top-4 capitalize">
        {sliderTitle || 'Top activities'}
      </Reveal>

      {/* Check Items */}
      {destinations && destinations.length > 0 && (
        <Reveal variant="lift" delay={120}>
          <ProductSlider data={destinations} />
        </Reveal>
      )}
    </Reveal>
  );
};

export default ProductSliderSection;
