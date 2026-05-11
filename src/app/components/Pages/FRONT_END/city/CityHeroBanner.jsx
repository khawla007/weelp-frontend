'use client';
import GallerySlider from '@/app/components/sliders/GallerySlider';
import * as Icons from '../../../../../../public/assets/Icons/Icons';
import BreadCrumb from '@/app/components/BreadCrumb';

const CityHeroBanner = ({ city }) => {
  const { name = '', description = '', media_gallery = [] } = city || {};

  return (
    <section className="flex min-h-[420px] md:min-h-[480px] lg:h-[60vh] py-12 relative page_city_banner overflow-hidden" style={{ background: 'linear-gradient(-165deg, #f8faf9, #f2f7f5)' }}>
      <div className="flex flex-col lg:flex-row container mx-auto gap-4 p-6 py-6 md:py-10 lg:py-12">
        <div className="relative flex-1 w-full lg:w-1/3 lg:pl-6 py-4 p-6">
          <BreadCrumb className="mb-4 text-[#71717a]" />
          <h2 className="text-xl md:text-2xl font-medium mb-4 capitalize text-[#18181b]">Things to do In</h2>
          <h1 className="section-opener leading-[1.1] text-pretty mb-4 capitalize">{name}</h1>
          <p
            className="text-base md:text-lg max-w-full md:max-w-[391px] leading-relaxed text-wrap text-[#71717a]"
            style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 500, lineHeight: 1.55 }}
          >
            {description}
          </p>
        </div>

        <div className="w-full lg:w-2/3">
          <GallerySlider data={media_gallery} />
        </div>
      </div>

      {/* Decorative SVG vectors */}
      <Icons.Vector2 className="hidden lg:block absolute bottom-0 left-0 -translate-x-14 scale-125 rotate-45 text-[#588f7a]" />
      <Icons.Vector2 className="hidden lg:block absolute bottom-16 left-4 rotate-45 scale-[.2] text-[#588f7a]" />
    </section>
  );
};

export default CityHeroBanner;
