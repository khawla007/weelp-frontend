'use client';
import React from 'react';
import GallerySlider from '@/app/components/sliders/GallerySlider';
import * as Icons from '../../../../../../public/assets/Icons/Icons';
import BreadCrumb from '@/app/components/BreadCrumb';

const CityHeroBanner = ({ city }) => {
  const { name = '', description = '', media_gallery = [] } = city || {};

  return (
    <section className="flex lg:h-[60vh] py-12 relative page_city_banner overflow-hidden" style={{ background: 'linear-gradient(-165deg, #F7FAFC, #ECF4F2)' }}>
      <div className="flex flex-col lg:flex-row container mx-auto gap-4 p-6">
        <div className="relative flex-1 w-full lg:w-1/3 py-4">
          <BreadCrumb className="mb-4 text-[#566872]" />
          <h2 className="text-lg sm:text-2xl mb-4 capitalize text-[#254255]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600, fontSize: '24px' }}>
            Things to do In
          </h2>
          <h1 className="mb-4 capitalize leading-tight text-[#10293A]" style={{ fontFamily: 'degular_demo, Degular Demo, sans-serif', fontWeight: 600, fontSize: '62px' }}>
            {name}
          </h1>
          <p className="text-wrap max-w-[391px] text-[#4E6574]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 500, fontSize: '19px', lineHeight: 1.55 }}>
            {description}
          </p>
        </div>

        <div className="w-full lg:w-2/3">
          <GallerySlider data={media_gallery} />
        </div>
      </div>

      {/* Decorative SVG vectors */}
      <Icons.Vector2 className="hidden lg:block absolute bottom-0 left-0 -translate-x-14 scale-125 rotate-45 text-[#57947d]" />
      <Icons.Vector2 className="hidden lg:block absolute bottom-16 left-4 rotate-45 scale-[.2] text-[#57947d]" />
    </section>
  );
};

export default CityHeroBanner;
