'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

// Static data for featured packages (will be replaced with API later)
const featuredPackages = [
  {
    id: 1,
    title: 'Mountain Tour',
    price: 850.0,
    duration: '7 Days',
    image: '/assets/images/Frame.jpg',
  },
  {
    id: 2,
    title: 'Yachts Tour',
    price: 750.0,
    duration: '6 Days',
    image: '/assets/images/china.jpg',
  },
  {
    id: 3,
    title: 'Beach Getaway',
    price: 620.0,
    duration: '5 Days',
    image: '/assets/images/Automn.webp',
  },
  {
    id: 4,
    title: 'Desert Adventure',
    price: 540.0,
    duration: '4 Days',
    image: '/assets/images/special.png',
  },
];

export default function FeaturedPackagesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Card width + gap (380px + 16px = 396px)
  const cardWidth = 396;

  // With spacer at end, we can scroll one more position
  // to show the last card fully
  const maxIndex = Math.max(0, featuredPackages.length - 1);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold drop-shadow-md">Featured Packages</h3>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            aria-label="Previous packages"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            aria-label="Next packages"
          >
            <ChevronRight size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Slider Container */}
      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * cardWidth}px)`,
          }}
        >
          {featuredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="package-card flex-shrink-0 rounded-2xl overflow-hidden flex flex-row"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                width: '380px',
                maxWidth: '100%',
                padding: '16px',
                gap: '16px',
              }}
            >
              {/* Card Image - Left Side */}
              <div className="flex-shrink-0 overflow-hidden rounded-2xl" style={{ width: '150px', height: '150px' }}>
                <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
              </div>

              {/* Card Content - Right Side */}
              <div className="flex flex-col justify-center" style={{ gap: '8px' }}>
                <h4 className="font-semibold text-white leading-tight" style={{ fontSize: '18px' }}>
                  {pkg.title}
                </h4>
                <p className="text-white font-bold" style={{ fontSize: '18px' }}>
                  ${pkg.price.toFixed(2)}/Person
                </p>
                <div className="flex items-center gap-1 text-white" style={{ fontSize: '16px' }}>
                  <Clock size={16} />
                  <span>{pkg.duration}</span>
                </div>
                <button
                  className="bg-transparent hover:bg-white hover:text-gray-800 text-white px-6 py-2.5 rounded-full transition-colors font-medium"
                  style={{
                    border: '1px solid rgb(255, 255, 255)',
                    fontSize: '15px',
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}

          {/* Empty spacer to allow last card to be fully visible */}
          <div className="flex-shrink-0" style={{ width: '400px' }} aria-hidden="true" />
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
