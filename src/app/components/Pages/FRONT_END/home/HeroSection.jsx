'use client';

import React from 'react';
import FilterBar from './FilterBar';

const HeroSection = () => {
  return (
    <section
      className="relative w-full flex items-center justify-center"
      style={{
        backgroundImage: 'url(/assets/images/hero_illustration.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#d9ede2',
        height: '615px',
      }}
    >
      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl mx-auto">
        <h1
          className="text-[38px] mb-3"
          style={{
            fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
            fontWeight: 600,
            color: '#0c2536',
          }}
        >
          Plan and Book
        </h1>
        <p
          className="text-[29px] mb-8"
          style={{
            fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
            fontWeight: 500,
            color: '#667085',
          }}
        >
          The Best Experiences Around You
        </p>
        <FilterBar />
      </div>
    </section>
  );
};

export default HeroSection;
