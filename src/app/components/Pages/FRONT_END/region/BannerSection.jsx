import * as Icons from '../../../../../../public/assets/Icons/Icons';
import BreadCrumb from '@/app/components/BreadCrumb';

const bannerImage = '/assets/images/CountryBanner.webp';

const BannerSection = ({ regionDetails }) => {
  const { name = '', description = '' } = regionDetails || {};

  return (
    <section
      className="weelp-hero-rise page_country_banner relative mb-10 flex min-h-[280px] sm:min-h-[320px] md:mb-16 md:min-h-[360px] lg:mb-24 lg:min-h-[60vh]"
      style={{ background: 'linear-gradient(to bottom, #FFFFFF, #f2f7f5)' }}
    >
      <div className="relative mx-auto flex h-full w-full items-center">
        <div className="flex flex-[1] flex-col items-start gap-4 p-5 sm:p-8 md:p-12 lg:p-20">
          <div className="flex flex-col justify-start gap-4">
            <BreadCrumb className="text-muted-foreground" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold capitalize text-foreground">
              {name ? (
                <span className="weelp-rise-mask weelp-rise-mask--block">
                  <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
                    {name}
                  </span>
                </span>
              ) : null}
            </h1>
            <p className="mb-4 text-base sm:text-lg font-medium text-weelp-steel">
              {description ? (
                <span className="weelp-rise-mask weelp-rise-mask--block">
                  <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>
                    {description}
                  </span>
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <Icons.Vector1 className="absolute left-[48%] z-10 hidden xl:block" />
        <Icons.Vector2 className="absolute bottom-0 left-2 z-0 w-32 sm:w-40 lg:w-48" />
        <div className="relative hidden h-full w-full flex-[1] items-end justify-start bg-cover bg-no-repeat lg:flex" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
          <div className="absolute left-[20%] top-[70%] z-10">
            <p className="w-3/5 rounded-lg bg-weelp-sage-deep/90 p-4 text-lg text-white shadow-sm backdrop-blur-sm">
              This far flung region is made of icy blue waters and snow covered landscapes of incredible beauty.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
