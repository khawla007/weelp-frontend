import NavigationLink from '@/app/components/Navigation/NavigationLink';
import Reveal from '@/app/components/ui/Reveal';
import AboutImage from './AboutImage';
import BlurRevealHeading from './BlurRevealHeading';
import styles from './AboutPage.module.css';

const ctaImage = { src: '/assets/images/hero_redesigned_bg.jpeg', alt: 'A traveler planning the next Weelp journey', fallbackLabel: 'Journey image unavailable' };
// dark-mode-exempt: white button intentionally sits on the sage-deep overlay in both themes
const ctaButtonClassName = 'mt-6 inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-weelp-sage-text transition-colors hover:bg-white/90';

const AboutCTA = () => (
  <section data-about-section="cta" className={styles.fullBleedBand}>
    <Reveal variant="lift" className={`${styles.ctaImage} ${styles.imageShell}`}>
      <AboutImage {...ctaImage} fill sizes="100vw" className={`object-cover ${styles.imageZoom}`} />
      <div className="absolute inset-0 bg-weelp-sage-deep/70" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <BlurRevealHeading className="max-w-[22ch] text-white">Ready to plan your next unforgettable journey?</BlurRevealHeading>
        <p className="mt-3 max-w-[48ch] text-white/85">Discover curated experiences and local guides in destinations across the globe.</p>
        <NavigationLink href="/activities" data-weelp-button-link className={ctaButtonClassName}>
          Start planning
        </NavigationLink>
      </div>
    </Reveal>
  </section>
);

export default AboutCTA;
