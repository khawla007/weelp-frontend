import { ArrowUpRight, Compass, MapPin } from 'lucide-react';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import Reveal from '@/app/components/ui/Reveal';
import AboutImage from './AboutImage';
import SectionBadge from './SectionBadge';
import styles from './AboutPage.module.css';

const images = {
  lead: { src: '/assets/images/CountryBanner.jpeg', alt: 'Travelers overlooking a destination', fallbackLabel: 'Destination image unavailable' },
  center: { src: '/assets/images/china.jpg', alt: 'A curated Weelp destination', fallbackLabel: 'Destination image unavailable' },
  right: { src: '/assets/images/hero_redesigned_bg.jpeg', alt: 'A memorable journey with Weelp', fallbackLabel: 'Journey image unavailable' },
};

const AboutOffer = () => (
  <section data-about-section="statement" className="mb-14 w-full bg-weelp-sage-wash py-14 md:mb-20 md:py-20 lg:mb-28 lg:py-28">
    <div className="container-page">
      <div data-testid="about-masonry-header" className={`mb-10 md:mb-14 ${styles.masonryHeader}`}>
        <Reveal variant="left">
          <SectionBadge icon={Compass}>What We Offer</SectionBadge>
        </Reveal>
        <Reveal variant="lift" className={styles.masonryHeadline}>
          <h2 className="section-opener max-w-[23ch] text-foreground">Weelp, a trusted travel partner dedicated to meaningful journeys</h2>
        </Reveal>
        <Reveal variant="right" className={styles.masonryAction}>
          <NavigationLink href="/contact-us" className="group inline-flex items-center gap-2 text-sm font-semibold text-weelp-sage-text">
            Get in touch <ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </NavigationLink>
        </Reveal>
      </div>

      <div className={styles.masonryGrid}>
        <Reveal variant="left" data-testid="about-masonry-column" className={`${styles.masonryColumn} ${styles.masonryColumnLeft}`}>
          <div className={`rounded-[24px] ${styles.masonryVisual} ${styles.imageShell}`}>
            <AboutImage {...images.lead} fill sizes="(max-width: 768px) 100vw, 34vw" className={`object-cover ${styles.imageZoom}`} />
            <div className="absolute inset-x-4 bottom-4 rounded-[20px] bg-background/90 p-6 backdrop-blur-md">
              <h3 className="text-xl text-foreground">Designed around the way you want to travel</h3>
              <NavigationLink href="/activities" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-weelp-sage-text">
                Explore experiences <ArrowUpRight size={16} />
              </NavigationLink>
            </div>
          </div>
        </Reveal>

        <Reveal variant="lift" data-testid="about-masonry-column" className={`${styles.masonryColumn} ${styles.masonryColumnCenter}`}>
          <div className="rounded-[24px] border border-border bg-background p-7 md:p-9">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-weelp-sage-text">About Weelp</p>
            <p className="text-base leading-[1.75] text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae justo sit amet mi posuere feugiat, sed viverra lectus.
            </p>
          </div>
          <div className={`rounded-[24px] ${styles.masonryImage} ${styles.imageShell}`}>
            <AboutImage {...images.center} fill sizes="(max-width: 768px) 100vw, 34vw" className={`object-cover ${styles.imageZoom}`} />
          </div>
        </Reveal>

        <Reveal variant="right" data-testid="about-masonry-column" className={`${styles.masonryColumn} ${styles.masonryColumnRight}`}>
          <div className={`rounded-[24px] ${styles.masonryImage} ${styles.imageShell}`}>
            <AboutImage {...images.right} fill sizes="(max-width: 768px) 100vw, 34vw" className={`object-cover ${styles.imageZoom}`} />
            <div className={`rounded-[18px] bg-weelp-sage-deep p-5 text-white ${styles.masonryMetric}`}>
              <p className="text-3xl font-semibold text-white">120+</p>
              <p className="mt-1 text-xs text-white/80">destinations</p>
            </div>
          </div>
          <div className="rounded-[24px] bg-weelp-sage-deep p-7 text-white md:p-9">
            <MapPin size={26} aria-hidden="true" />
            <p className="mt-6 text-base leading-[1.75] text-white/80">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer id nibh vel lectus interdum feugiat.</p>
          </div>
        </Reveal>
      </div>

      <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
        <span className="relative h-9 w-9 overflow-hidden rounded-full">
          <AboutImage src="/assets/images/user.png" alt="Weelp travel planner" fill sizes="36px" className="object-cover" />
        </span>
        <p className="text-sm text-muted-foreground">
          Let&apos;s plan something unforgettable together.{' '}
          <NavigationLink href="/contact-us" className="font-semibold text-weelp-sage-text underline underline-offset-4">
            Get in touch
          </NavigationLink>
        </p>
      </div>
    </div>
  </section>
);

export default AboutOffer;
