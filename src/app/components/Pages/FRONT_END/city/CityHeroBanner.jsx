'use client';
import GallerySlider from '@/app/components/sliders/GallerySlider';
import * as Icons from '../../../../../../public/assets/Icons/Icons';
import BreadCrumb from '@/app/components/BreadCrumb';

const CityHeroBanner = ({ city }) => {
  const { name = '', description = '', media_gallery = [] } = city || {};

  return (
    <section
      className="weelp-hero-rise relative isolate mb-10 md:mb-16 flex w-full items-center justify-center overflow-hidden page_city_banner lg:mb-24 min-h-[615px] py-10 lg:h-[615px] lg:py-0"
      style={{
        background: 'linear-gradient(-165deg, #f8faf9, #f2f7f5)',
      }}
    >
      <div className="container-page relative z-10 flex h-full flex-col items-center justify-center gap-4 lg:flex-row">
        <div className="relative flex-1 w-full lg:w-1/3">
          <BreadCrumb className="mb-4 text-[#71717a]" />
          <h2 className="text-xl md:text-2xl font-medium mb-4 capitalize text-[#18181b]">Things to do In</h2>
          <h1 className="section-opener leading-[1.1] text-pretty mb-4 capitalize">{name}</h1>
          <p className="text-base md:text-lg max-w-full md:max-w-[391px] leading-relaxed text-wrap text-[#71717a]" style={{ fontWeight: 500, lineHeight: 1.55 }}>
            {description}
          </p>
        </div>

        <div className="w-full lg:w-2/3">
          <GallerySlider data={media_gallery} collapseHiddenThumbnails />
        </div>
      </div>

      {/* Decorative SVG vectors */}
      <Icons.Vector2 aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 z-0 hidden text-[#588f7a] lg:block" />
      <Icons.VectorArrow aria-hidden="true" className="pointer-events-none absolute bottom-[125px] left-[167.1px] z-0 hidden -rotate-[27.247deg] text-[#588f7a] lg:block" />
    </section>
  );
};

export default CityHeroBanner;
