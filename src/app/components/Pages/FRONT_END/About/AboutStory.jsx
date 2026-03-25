'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

const AboutStory = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="container mx-auto px-4 py-[70px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div>
          <h2 className="text-[28px] font-medium mb-6" style={{ fontFamily: fontIT, color: '#273F4E' }}>
            Our Story
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ fontFamily: fontIT, color: '#667085' }}>
            From a simple idea to a global platform, Weelp was born from a passion for travel and a desire to connect people with authentic experiences around the world.
          </p>
          <p className="text-base leading-relaxed mb-4" style={{ fontFamily: fontIT, color: '#667085' }}>
            What started as a small team of travel enthusiasts has grown into a community of explorers, adventure seekers, and culture lovers united by the same goal: making travel accessible,
            memorable, and meaningful.
          </p>
          <p className="text-base leading-relaxed" style={{ fontFamily: fontIT, color: '#667085' }}>
            Today, Weelp connects travelers with local experiences in destinations across the globe, always staying true to our roots of authenticity, quality, and customer care.
          </p>
        </div>

        {/* Image */}
        <div className="relative h-[300px] md:h-[400px] w-full">
          {!imageError ? (
            <Image src="/assets/images/about-story.jpg" alt="Our Story - Weelp journey" fill className="rounded-[28px] object-cover" onError={() => setImageError(true)} />
          ) : (
            <div className="w-full h-full rounded-[28px] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">W</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutStory;
