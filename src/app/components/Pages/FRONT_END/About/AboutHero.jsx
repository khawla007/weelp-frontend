import { ChevronRight } from 'lucide-react';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import AboutImage from './AboutImage';
import styles from './AboutPage.module.css';

const AboutHero = () => (
  <section data-about-section="hero" className={`weelp-hero-rise relative mb-10 flex items-end overflow-hidden pb-14 md:mb-16 md:pb-20 lg:mb-24 lg:pb-24 ${styles.hero}`}>
    <div className={`${styles.heroMedia} ${styles.imageShell}`}>
      <AboutImage src="/assets/images/hero_bg_1.jpg" alt="" fill loading="eager" sizes="100vw" className={`object-cover ${styles.imageZoom}`} />
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/68 to-white/15 dark:from-black/90 dark:via-black/64 dark:to-black/20" />
    <div className="container-page relative z-10">
      <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-weelp-sage-deep/20 bg-background/80 px-4 py-1.5 text-xs font-semibold text-weelp-sage-text backdrop-blur-sm">
        <NavigationLink href="/" className="text-weelp-sage-text hover:text-weelp-sage-hover">
          Home
        </NavigationLink>
        <ChevronRight size={13} aria-hidden="true" />
        <span aria-current="page">About Us</span>
      </div>
      <h1 className="max-w-[13ch] text-[clamp(2.5rem,6.4vw,5.75rem)] leading-[0.96] tracking-[-0.045em] text-foreground">
        <span className="weelp-rise-mask weelp-rise-mask--block">
          <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
            Shaping journeys through experience and care
          </span>
        </span>
      </h1>
      <p className="lead mt-5 max-w-[560px] text-muted-foreground">
        <span className="weelp-rise-mask weelp-rise-mask--block">
          <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>
            We connect travelers with authentic local experiences, built on trust, curiosity, and a people-first approach.
          </span>
        </span>
      </p>
    </div>
  </section>
);

export default AboutHero;
