import Image from 'next/image';
import { ShieldCheck, Heart, Sparkles, Lightbulb, Leaf } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';
import SectionBadge from './SectionBadge';

const cells = [
  { icon: Heart, title: 'Customer first', desc: 'Travelers at the heart of every decision we make.' },
  { icon: Sparkles, title: 'Authenticity', desc: 'Real experiences, real connections, real memories.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'Better tools and ideas for smoother journeys.' },
  { icon: Leaf, title: 'Sustainability', desc: 'Responsible travel for future generations.' },
];

const avatars = ['/assets/images/team-1.jpg', '/assets/images/team-2.jpg', '/assets/images/team-3.jpg', '/assets/images/team-4.jpg'];

const AboutWhyChoose = () => (
  <section className="container-page pb-10 md:pb-16 lg:pb-24">
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
      <Reveal variant="lift" className="relative">
        <div className="relative h-[360px] w-full overflow-hidden rounded-[24px] bg-muted md:h-[460px]">
          <Image src="/assets/images/CountryBanner.jpeg" alt="Local Weelp guide" fill className="object-cover" />
        </div>
        <div className="absolute -bottom-6 left-4 rounded-[24px] bg-weelp-sage-deep p-5 text-white shadow-lg md:left-6">
          <p className="text-2xl font-bold">90+</p>
          <p className="mb-3 text-sm text-white/80">Local guides</p>
          <div className="flex -space-x-3">
            {avatars.map((src) => (
              <span key={src} className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-weelp-sage-deep">
                <Image src={src} alt="" fill className="object-cover" />
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal initialHidden stagger={60} variant="lift">
        <SectionBadge icon={ShieldCheck}>Why Choose Us</SectionBadge>
        <h2 className="mb-3 mt-4 text-foreground">Why travelers trust Weelp for the journey</h2>
        <p className="mb-8 max-w-[55ch] text-muted-foreground">The values that guide how we build experiences and treat every traveler and partner.</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {cells.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title}>
                <div className="mb-3 text-weelp-sage-text">
                  <Icon size={28} />
                </div>
                <h3 className="mb-1 text-lg text-foreground">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </Reveal>
    </div>
  </section>
);

export default AboutWhyChoose;
