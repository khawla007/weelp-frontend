'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Check } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';
import SectionBadge from './SectionBadge';

const checklist = [
  'Handpicked local guides in every destination',
  'Transparent pricing, no hidden fees',
  'Verified reviews from real travelers',
  'Sustainable, community-first tourism',
  '24/7 support before and during your trip',
];

const AboutStory = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="container-page pb-10 md:pb-16 lg:pb-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal variant="lift" className="relative">
          <div className="relative h-[340px] w-full md:h-[440px]">
            {!imageError ? (
              <Image src="/assets/images/about-story.jpg" alt="Weelp travelers on a guided experience" fill className="rounded-[24px] object-cover" onError={() => setImageError(true)} />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-muted">
                <span className="text-4xl text-muted-foreground">W</span>
              </div>
            )}
          </div>
          <div className="absolute -top-6 right-2 rounded-[24px] bg-weelp-sage-deep p-6 text-white shadow-lg md:right-6">
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-bold">120+</p>
                <p className="text-sm text-white/80">Destinations</p>
              </div>
              <div>
                <p className="text-3xl font-bold">40+</p>
                <p className="text-sm text-white/80">Local partners</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal initialHidden stagger={60} variant="lift">
          <SectionBadge icon={BookOpen}>Our Story</SectionBadge>
          <h2 className="mb-4 mt-4 text-foreground">Travel dedicated to authenticity and meaningful connection</h2>
          <p className="mb-4 max-w-[60ch] text-base leading-[1.6] text-muted-foreground">
            From a simple idea to a global platform, Weelp was born from a passion for travel and a desire to connect people with authentic experiences around the world.
          </p>
          <p className="mb-6 max-w-[60ch] text-base leading-[1.6] text-muted-foreground">
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
          <a href="/contact-us" className="inline-flex items-center rounded-full bg-weelp-sage-deep px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-weelp-sage-hover">
            Contact our team
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutStory;
