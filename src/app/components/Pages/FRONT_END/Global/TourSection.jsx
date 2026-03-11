import React from 'react';
import ProductSlider from '../../../sliders/ProductSlider';

// Tour is itemtype === packages
export const TourSection = ({ items }) => {
  return (
    <section className="container mx-auto flex flex-col gap-3 p-4 sm:my-10 productSlider">
      <h2 className="text-lg sm:text-[28px] font-medium text-Nileblue capitalize">{'Top Tours'}</h2>
      {items && items.length > 0 && <ProductSlider data={items} />}
    </section>
  );
};
