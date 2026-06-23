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
          <BreadCrumb className="mb-4 text-muted-foreground" />
          <h2 className="text-xl md:text-2xl font-medium mb-4 capitalize text-foreground">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '120ms' }}>
                Things to do In
              </span>
            </span>
          </h2>
          <h1 className="section-opener leading-[1.1] text-pretty mb-4 capitalize">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
                {name}
              </span>
            </span>
          </h1>
          {description ? (
            <p className="text-base md:text-lg max-w-full md:max-w-[391px] leading-relaxed text-wrap text-muted-foreground" style={{ fontWeight: 500, lineHeight: 1.55 }}>
              <span className="weelp-rise-mask weelp-rise-mask--block">
                <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>
                  {description}
                </span>
              </span>
            </p>
          ) : null}
        </div>

        <div className="weelp-hero-rise w-full lg:w-2/3" style={{ '--weelp-motion-delay': '360ms' }}>
          <GallerySlider data={media_gallery} collapseHiddenThumbnails />
        </div>
      </div>

      {/* Decorative SVG vectors */}
      <Icons.Vector2 aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 z-0 hidden text-weelp-sage-deep lg:block" />
      <Icons.VectorArrow aria-hidden="true" className="pointer-events-none absolute bottom-[125px] left-[167.1px] z-0 hidden -rotate-[27.247deg] text-weelp-sage-deep lg:block" />
    </section>
  );
};

export default CityHeroBanner;
