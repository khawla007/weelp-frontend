import React from 'react';
import Tours from './Tours';
import SingleProductCard, { SingleProductCardPackage } from '@/app/components/SingleProductCard';

// Tour is itemtype === packages
export const TourSection = ({ items, taglist }) => {
  return (
    <section className="container mx-auto flex flex-col gap-3 p-4 sm:my-4 ">
      <h2 className="text-lg sm:text-[28px] font-medium text-Nileblue capitalize">{'Top Tours'}</h2>
      <Tours items={items} taglist={taglist} />
    </section>
  );
};
