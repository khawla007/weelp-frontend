'use client';

import React from 'react';
import FilterBar from './FilterBar';
import FeaturedPackagesSlider from './FeaturedPackagesSlider';

const HeroSection = () => {
  return (
    <section
      className="relative w-full h-[75vh] min-h-[500px] flex items-center"
      style={{
        backgroundImage: 'url(/assets/images/hero_bg_1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col md:flex-row h-full items-center gap-8">
          {/* Left Side - Text Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">Plan and Book</h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">The best experiences around you.</p>
          </div>

          {/* Right Side - Filter + Slider */}
          <div className="w-full md:w-1/2 flex flex-col gap-6 px-8 md:px-16">
            <FilterBar />
            <FeaturedPackagesSlider />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
