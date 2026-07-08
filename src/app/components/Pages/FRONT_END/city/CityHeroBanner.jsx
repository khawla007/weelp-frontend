'use client';
import GallerySlider from '@/app/components/sliders/GallerySlider';
import * as Icons from '../../../../../../public/assets/Icons/Icons';
import BreadCrumb from '@/app/components/BreadCrumb';

const CityHeroBanner = ({ city }) => {
  const { name = '', description = '', media_gallery = [] } = city || {};

  return (
    <section className="weelp-hero-rise page_city_banner relative isolate mb-6 flex w-full items-center justify-center overflow-hidden bg-[linear-gradient(-165deg,#f8faf9,#f2f7f5)] py-6 dark:bg-[radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(145deg,#050505_0%,#111111_48%,#000000_100%)] md:mb-16 md:min-h-[615px] md:py-10 lg:mb-24 lg:h-[615px] lg:py-0">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-weelp-sage-deep/35 to-transparent dark:via-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-20 hidden size-72 rounded-full bg-weelp-sage-tint/25 blur-3xl dark:bg-foreground/5 lg:block" />

      <div className="container-page relative z-10 flex h-full flex-col items-center justify-center gap-4 md:gap-6 lg:flex-row lg:gap-10">
        <div className="relative w-full flex-1 rounded-2xl border border-transparent p-0 dark:border-white/10 dark:bg-background/45 dark:p-6 dark:shadow-none dark:backdrop-blur-md lg:w-1/3">
          <BreadCrumb className="mb-3 text-muted-foreground dark:text-label" />
          <h2 className="mb-2 text-base font-medium capitalize text-foreground md:mb-4 md:text-2xl">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '120ms' }}>
                Things to do In
              </span>
            </span>
          </h2>
          <h1 className="section-opener mb-3 text-pretty capitalize leading-[1.08] text-foreground md:mb-4">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
                {name}
              </span>
            </span>
          </h1>
          {description ? (
            <p className="max-w-full text-wrap text-sm font-medium leading-relaxed text-muted-foreground dark:text-copy md:max-w-[391px] md:text-lg" style={{ lineHeight: 1.5 }}>
              <span className="weelp-rise-mask weelp-rise-mask--block">
                <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>
                  {description}
                </span>
              </span>
            </p>
          ) : null}
        </div>

        <div className="weelp-hero-rise w-full rounded-2xl ring-1 ring-black/5 dark:bg-card/60 dark:ring-white/10 lg:w-2/3" style={{ '--weelp-motion-delay': '360ms' }}>
          <GallerySlider data={media_gallery} collapseHiddenThumbnails />
        </div>
      </div>

      {/* Decorative SVG vectors */}
      <Icons.Vector2 aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 z-0 hidden text-weelp-sage-deep/70 dark:text-white/10 lg:block" />
      <Icons.VectorArrow aria-hidden="true" className="pointer-events-none absolute bottom-[125px] left-[167.1px] z-0 hidden -rotate-[27.247deg] text-weelp-sage-deep/70 dark:text-white/10 lg:block" />
    </section>
  );
};

export default CityHeroBanner;
