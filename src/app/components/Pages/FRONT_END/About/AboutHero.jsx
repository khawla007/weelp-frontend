import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const AboutHero = () => (
  <section className="weelp-hero-rise relative mb-10 flex h-[420px] items-center overflow-hidden md:mb-16 md:h-[520px] lg:mb-24">
    <Image src="/assets/images/hero_bg_1.jpg" alt="" fill priority className="object-cover" />
    <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/75 to-white/35 dark:from-black/85 dark:via-black/65 dark:to-black/35" />
    <div className="container-page relative">
      <nav aria-label="Breadcrumb" className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-weelp-sage-tint/50 px-4 py-1.5 text-xs font-semibold text-weelp-sage-text">
        <span>Home</span>
        <ChevronRight size={13} aria-hidden="true" />
        <span>About Us</span>
      </nav>
      <h1 className="max-w-[640px] text-foreground">
        <span className="weelp-rise-mask weelp-rise-mask--block">
          <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>Shaping journeys through experience and care</span>
        </span>
      </h1>
      <p className="lead mt-3 max-w-[560px] text-muted-foreground">
        <span className="weelp-rise-mask weelp-rise-mask--block">
          <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>We connect travelers with authentic local experiences, built on trust, curiosity, and a people-first approach.</span>
        </span>
      </p>
    </div>
  </section>
);

export default AboutHero;
