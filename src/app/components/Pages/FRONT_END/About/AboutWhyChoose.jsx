import { ShieldCheck, Heart, Sparkles, Lightbulb, Leaf } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';
import AboutImage from './AboutImage';
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
  <section data-about-section="process" className="mb-14 bg-weelp-sage-deep py-14 md:mb-20 md:py-20 lg:mb-28 lg:py-28">
    <div className={`container-page ${styles.whyGrid}`}>
      <Reveal variant="left" className="relative">
        <div className={`${styles.whyImage} ${styles.imageShell}`}>
          <AboutImage {...whyImage} fill sizes="(max-width: 1024px) 100vw, 52vw" className={`object-cover ${styles.imageZoom}`} />
        </div>
        <div className={`rounded-[22px] border border-white/20 bg-background p-6 shadow-lg ${styles.whyMetric}`}>
          <p className="text-4xl font-semibold text-foreground">90+</p>
          <p className="mt-2 text-sm text-muted-foreground">Local guides</p>
        </div>
      </Reveal>

      <Reveal variant="right">
        {/* dark-mode-exempt: translucent white badge is intentional on the permanent sage-deep section */}
        <SectionBadge icon={ShieldCheck} className="bg-white/10 text-white">
          Why Choose Us
        </SectionBadge>
        <h2 className="section-opener mb-4 mt-5 max-w-[18ch] text-white">Why travelers trust Weelp for the journey</h2>
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
