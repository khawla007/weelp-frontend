import Image from 'next/image';
import { Compass, Award } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';
import SectionBadge from './SectionBadge';

const features = [
  { title: 'Curated experiences', desc: 'Every trip is handpicked and quality-checked by our travel team.', img: '/assets/images/CountryBanner.jpeg', tags: ['Curated', 'Quality'] },
  { title: 'Local guides', desc: 'Explore with people who call the destination home.', img: '/assets/images/china.jpg', tags: ['Local', 'Authentic'] },
  { title: 'Flexible booking', desc: 'Plans change. Free cancellation on most experiences.', img: '/assets/images/hero_redesigned_bg.jpeg', tags: ['Flexible', 'Secure'] },
];

const AboutOffer = () => (
  <section className="mb-10 w-full bg-weelp-sage-wash py-10 md:mb-16 md:py-16 lg:mb-24 lg:py-24">
    <div className="container-page">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <SectionBadge icon={Compass}>What We Offer</SectionBadge>
          <h2 className="mt-4 max-w-[20ch] text-foreground">Why travelers choose Weelp for every journey</h2>
        </div>
        <a
          href="/activities"
          className="inline-flex items-center rounded-full border border-weelp-sage-deep px-6 py-3 text-sm font-semibold text-weelp-sage-text transition-colors hover:bg-weelp-sage-deep hover:text-white"
        >
          Explore experiences
        </a>
      </div>

      <Reveal initialHidden stagger={80} variant="lift" className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-[24px] bg-weelp-sage-deep p-8 text-white md:row-span-2">
          <div>
            <h3 className="text-2xl">Delivering unforgettable travel, thoughtfully designed</h3>
            <p className="mt-3 text-white/80">From first search to safe return, we handle the details so you can focus on the experience.</p>
          </div>
          {/* dark-mode-exempt: white button intentionally sits on the sage-deep dark card in both themes */}
          <a href="/activities" className="mt-8 inline-flex w-fit items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-weelp-sage-text transition-colors hover:bg-white/90">
            Start exploring
          </a>
        </div>

        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-[24px] border border-border bg-background p-5 transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)] dark:hover:shadow-none"
          >
            <h3 className="mb-3 text-lg text-foreground">{f.title}</h3>
            <div className="relative mb-3 h-32 w-full overflow-hidden rounded-[16px] bg-muted">
              <Image src={f.img} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
            </div>
            <p className="mb-4 text-sm text-muted-foreground">{f.desc}</p>
            <div className="flex flex-wrap gap-2">
              {f.tags.map((t) => (
                <span key={t} className="rounded-full bg-weelp-sage-tint/50 px-3 py-1 text-xs font-medium text-weelp-sage-text">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="flex flex-col justify-center rounded-[24px] border border-border bg-background p-8">
          <div className="mb-2 text-weelp-sage-text">
            <Award size={28} />
          </div>
          <p className="text-4xl font-bold text-weelp-sage-text">15+</p>
          <p className="mt-1 text-sm text-muted-foreground">Years guiding travelers across the globe</p>
        </div>
      </Reveal>

      <div className="mt-8 flex items-center gap-3">
        <Image src="/assets/images/user.png" alt="" width={36} height={36} className="rounded-full" />
        <p className="text-sm text-muted-foreground">
          Let&apos;s plan something unforgettable together.{' '}
          <a href="/contact-us" className="font-semibold text-weelp-sage-text underline underline-offset-4">
            Get in touch
          </a>
        </p>
      </div>
    </div>
  </section>
);

export default AboutOffer;
