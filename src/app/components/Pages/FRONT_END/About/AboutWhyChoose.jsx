import { ShieldCheck, Heart, Sparkles, Lightbulb, Leaf } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';
import AboutImage from './AboutImage';
import BlurRevealHeading from './BlurRevealHeading';
import SectionBadge from './SectionBadge';
import styles from './AboutPage.module.css';

const cells = [
  { icon: Heart, title: 'Customer first', desc: 'Travelers at the heart of every decision we make.' },
  { icon: Sparkles, title: 'Authenticity', desc: 'Real experiences, real connections, real memories.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'Better tools and ideas for smoother journeys.' },
  { icon: Leaf, title: 'Sustainability', desc: 'Responsible travel for future generations.' },
];

const whyImage = { src: '/assets/images/CountryBanner.jpeg', alt: 'A local Weelp guide sharing a destination', fallbackLabel: 'Local guide image unavailable' };

const AboutWhyChoose = () => (
  <section data-about-section="process" className="bg-weelp-sage-deep">
    <div data-testid="about-process-split" className={`${styles.whyGrid} ${styles.fullBleedSplit}`}>
      <Reveal variant="left" className={styles.whyMedia}>
        <div className={`${styles.whyImage} ${styles.imageShell}`}>
          <AboutImage {...whyImage} fill sizes="(max-width: 1024px) 100vw, 52vw" className={`object-cover ${styles.imageZoom}`} />
        </div>
        <div className={`p-8 ${styles.whyMetric}`}>
          <p className="text-6xl font-semibold text-foreground">90+</p>
          <p className="mt-3 text-base font-semibold text-foreground">Local guides</p>
          <p className="mt-3 max-w-[24ch] text-sm leading-relaxed text-muted-foreground">Experts who turn unfamiliar places into personal stories.</p>
        </div>
      </Reveal>

      <Reveal variant="right" className={styles.whyContent}>
        {/* dark-mode-exempt: translucent white badge is intentional on the permanent sage-deep section */}
        <SectionBadge icon={ShieldCheck} className="bg-white/10 text-white">
          Why Choose Us
        </SectionBadge>
        <BlurRevealHeading className="section-opener mb-4 mt-5 max-w-[18ch] text-white">Why travelers trust Weelp for the journey</BlurRevealHeading>
        <p className="mb-10 max-w-[55ch] text-white/70">The values that guide how we build experiences and treat every traveler and partner.</p>
        <Reveal initialHidden stagger={90} variant="lift" className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2">
          {cells.map((cell) => {
            const Icon = cell.icon;
            return (
              <article data-testid="about-value-card" key={cell.title} className="border-t border-white/20 pt-5">
                <Icon aria-hidden="true" size={27} className="mb-5 text-white" />
                <h3 className="mb-2 text-lg text-white">{cell.title}</h3>
                <p className="text-sm leading-[1.65] text-white/65">{cell.desc}</p>
              </article>
            );
          })}
        </Reveal>
      </Reveal>
    </div>
  </section>
);

export default AboutWhyChoose;
