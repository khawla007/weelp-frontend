'use client';

import { useState } from 'react';
import Image from 'next/image';
import Reveal from '@/app/components/ui/Reveal';

const bodyFont = { fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 400, lineHeight: 1.6 };

const AboutStory = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="container-page pb-10 md:pb-16 lg:pb-24">
      <Reveal as="h2" variant="lift" className="mb-12 text-center text-[28px] text-foreground md:text-[28px]">
        Our Story
      </Reveal>
      <Reveal initialHidden stagger={60} variant="lift" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-base text-muted-foreground mb-4 max-w-[65ch]" style={bodyFont}>
            From a simple idea to a global platform, Weelp was born from a passion for travel and a desire to connect people with authentic experiences around the world.
          </p>
          <p className="text-base text-muted-foreground mb-4 max-w-[65ch]" style={bodyFont}>
            What started as a small team of travel enthusiasts has grown into a community of explorers, adventure seekers, and culture lovers united by the same goal: making travel accessible,
            memorable, and meaningful.
          </p>
          <p className="text-base text-muted-foreground max-w-[65ch]" style={bodyFont}>
            Today, Weelp connects travelers with local experiences in destinations across the globe, always staying true to our roots of authenticity, quality, and customer care.
          </p>
        </div>

        <div className="relative h-[300px] md:h-[400px] w-full">
          {!imageError ? (
            <Image src="/assets/images/about-story.jpg" alt="Our Story - Weelp journey" fill className="rounded-[24px] object-cover" onError={() => setImageError(true)} />
          ) : (
            <div className="w-full h-full rounded-[24px] bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-4xl">W</span>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
};

export default AboutStory;
