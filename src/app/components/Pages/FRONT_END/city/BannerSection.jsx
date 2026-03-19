'use client';
import React from 'react';
import GallerySlider from '@/app/components/sliders/GallerySlider';
import BreadCrumb from '@/app/components/BreadCrumb';

const BannerSection = ({ city }) => {
  const { name = '', description = '', media_gallery = [] } = city || {};

  return (
    <section
      className="flex lg:h-[60vh] py-12 relative page_city_banner"
      style={{ background: 'linear-gradient(to bottom, #FFFFFF, #F4F4F5)' }}
    >
      <div className="flex flex-col lg:flex-row container mx-auto gap-4 p-6">
        <div className="relative flex-1 w-full lg:w-1/3 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--weelp-home-copy)] mb-4">
            Things to do In
          </h2>
          <h1 className="font-home-heading text-4xl sm:text-5xl font-bold text-[var(--weelp-home-ink)] mb-4 capitalize">
            {name}
          </h1>
          <p className="text-[15px] leading-[1.4] text-[var(--weelp-home-copy)]">
            {description}
          </p>
          <BreadCrumb className="absolute xl:top-[70%] -top-4 text-[var(--weelp-home-copy)]" />
        </div>

        <div className="w-full lg:w-2/3">
          <GallerySlider data={media_gallery} navColor="#18181B" />
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
