import { BookOpen, Check } from 'lucide-react';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import Reveal from '@/app/components/ui/Reveal';
import AboutImage from './AboutImage';
import SectionBadge from './SectionBadge';
import styles from './AboutPage.module.css';

const checklist = [
  'Handpicked local guides in every destination',
  'Transparent pricing, no hidden fees',
  'Verified reviews from real travelers',
  'Sustainable, community-first tourism',
  '24/7 support before and during your trip',
];

const storyImage = {
  src: '/assets/images/about-story.jpg',
  alt: 'Weelp travelers sharing a guided local experience',
  fallbackLabel: 'Travel experience image unavailable',
};

const AboutStory = () => (
  <section data-about-section="story" className="container-page pb-14 md:pb-20 lg:pb-28">
    <div data-testid="about-story-grid" className={styles.storyGrid}>
      <Reveal variant="left" className={styles.storyHeading}>
        <SectionBadge icon={BookOpen}>Our Story</SectionBadge>
        <h2 className="section-opener mt-5 max-w-[17ch] text-foreground">Travel dedicated to authenticity and meaningful connection</h2>
      </Reveal>

      <Reveal variant="right" data-testid="about-story-stats" className={`overflow-hidden rounded-[24px] border border-border bg-weelp-sage-wash ${styles.storyStats}`}>
        <div className={`px-6 py-8 md:px-10 md:py-10 ${styles.storyStat}`}>
          <p className="text-4xl font-semibold text-foreground md:text-5xl">120+</p>
          <p className="mt-2 text-sm text-muted-foreground">Destinations</p>
        </div>
        <div className={`px-6 py-8 md:px-10 md:py-10 ${styles.storyStat}`}>
          <p className="text-4xl font-semibold text-foreground md:text-5xl">40+</p>
          <p className="mt-2 text-sm text-muted-foreground">Local partners</p>
        </div>
      </Reveal>

      <Reveal variant="left" className={`${styles.storyImage} ${styles.imageShell}`}>
        <AboutImage {...storyImage} fill sizes="(max-width: 768px) 100vw, 45vw" className={`object-cover ${styles.imageZoom}`} />
      </Reveal>

      <Reveal initialHidden variant="right" className={styles.storyCopy}>
        <p className="mb-4 max-w-[60ch] text-base leading-[1.7] text-muted-foreground">
          From a simple idea to a global platform, Weelp was born from a passion for travel and a desire to connect people with authentic experiences around the world.
        </p>
        <p className="mb-7 max-w-[60ch] text-base leading-[1.7] text-muted-foreground">
          What began as a small team of travel enthusiasts is now a community of explorers united by one goal: making travel accessible, memorable, and meaningful.
        </p>
        <ul className="mb-8 space-y-3">
          {checklist.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-weelp-sage-tint/60 text-weelp-sage-text">
                <Check size={14} />
              </span>
              <span className="text-sm text-foreground">{item}</span>
            </li>
          ))}
        </ul>
        <NavigationLink
          href="/contact-us"
          data-weelp-button-link
          className="inline-flex items-center rounded-full bg-weelp-sage-deep px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-weelp-sage-hover"
        >
          Contact our team
        </NavigationLink>
      </Reveal>
    </div>
  </section>
);

export default AboutStory;
