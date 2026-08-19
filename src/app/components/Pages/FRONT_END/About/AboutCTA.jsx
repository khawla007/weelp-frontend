import Image from 'next/image';
import Reveal from '@/app/components/ui/Reveal';

const AboutCTA = () => (
  <section className="container-page pb-10 md:pb-16 lg:pb-24">
    <Reveal variant="lift" className="relative overflow-hidden rounded-[24px]">
      <div className="relative h-[340px] w-full md:h-[400px]">
        <Image src="/assets/images/hero_redesigned_bg.jpeg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-weelp-sage-deep/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h2 className="max-w-[22ch] text-white">Ready to plan your next unforgettable journey?</h2>
          <p className="mt-3 max-w-[48ch] text-white/85">Discover curated experiences and local guides in destinations across the globe.</p>
          {/* dark-mode-exempt: white button intentionally sits on the sage-deep overlay in both themes */}
          <a href="/activities" className="mt-6 inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-weelp-sage-text transition-colors hover:bg-white/90">
            Start planning
          </a>
        </div>
      </div>
    </Reveal>
  </section>
);

export default AboutCTA;
