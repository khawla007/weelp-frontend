'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CornerDecorations } from './CornerDecorations';

// Helper function to construct full image URL
const getImgUrl = (imgPath) => {
  if (!imgPath) {
    return '/assets/images/destination-placeholder.jpg';
  }
  if (imgPath.startsWith('http')) return imgPath;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/';
  return `${baseUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
};

// Inner card component - matching reference layout exactly
// MOVED OUTSIDE to prevent unmounting/remounting on state changes
// This fixes the "jerk" by preserving DOM nodes during state updates.
const DestinationCard = ({ city, isActive, onClick }) => {
  const imageUrl = getImgUrl(city.feature_image || city.featured_image || city.image);

  return (
    <div
      onClick={onClick}
      className="destination-list relative overflow-hidden cursor-pointer rounded-[24px] h-[400px] sm:h-[500px] md:h-[600px] lg:h-[536px] group"
      style={{
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${city.name || 'destination'} destinations`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Background Image */}
      <img src={imageUrl} alt={city.name || 'Destination'} className="absolute inset-0 w-full h-full object-cover" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-700" />

      {/* Content Wrapper */}
      <div
        className="destination-content absolute inset-0 z-10"
        style={{
          padding: '30px',
          pointerEvents: 'none',
        }}
      >
        {/* 1. OUTER WRAPPER: Handles Position (Moves at card speed 0.7s) */}
        <div
          className="flex flex-col gap-1"
          style={{
            position: 'absolute',
            left: isActive ? '30px' : 'calc(50% - 150px)',
            bottom: isActive ? '80px' : 'calc(70% - 170px)',
            width: '300px',
            transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'auto',
          }}
        >
          {/* 2. INNER WRAPPER: Smooth rotation with compensation */}
          <div
            style={{
              // Rotate -90deg when inactive, 0deg when active
              // Using center origin for proper positioning
              transform: isActive ? 'rotate(0deg)' : 'rotate(-90deg)',
              transformOrigin: isActive ? 'bottom center' : 'center center',
              transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left',
              width: '100%',
              willChange: 'transform',
            }}
          >
            <h4
              className="box-title"
              style={{
                fontSize: '28px',
                lineHeight: '1.2',
                fontWeight: '700',
                margin: '0',
                color: '#fff',
                fontFamily: 'var(--font-interTight), sans-serif',
              }}
            >
              <Link href={`/city/${city.slug || city.id}`} className="text-white hover:text-white" onClick={(e) => e.stopPropagation()}>
                {city.name || 'Thailand'}
              </Link>
            </h4>

            {/* Listing Count */}
            <span
              className="destination-subtitle text-white block opacity-90"
              style={{
                fontSize: '16px',
                margin: '0',
                fontWeight: '500',
                fontFamily: 'var(--font-interTight), sans-serif',
              }}
            >
              15 Listing
            </span>
          </div>
        </div>

        {/* Book Now Button - aligned with text baseline */}
        <div
          className="absolute"
          style={{
            right: '30px',
            bottom: '80px', // Same as text bottom position
            opacity: isActive ? '1' : '0',
            transform: isActive ? 'translateX(0)' : 'translateX(20px)',
            transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            visibility: isActive ? 'visible' : 'hidden',
          }}
        >
          <Link
            href={`/city/${city.slug || city.id}`}
            className="th-btn pointer-events-auto inline-flex items-center justify-center bg-transparent border border-white/40 text-white hover:bg-white hover:text-black transition-all duration-300"
            style={{
              height: '55px', // Larger professional size
              borderRadius: '50px',
              padding: '0 35px',
              whiteSpace: 'nowrap',
              fontSize: '16px',
              fontWeight: '700',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

const ExpandableFeaturedDestinations = ({ data = [], title = 'Top Destinations' }) => {
  // State: track clicked (locked) card - NO hover state per reference requirement
  // Default: 4th card (index 3) active like reference website
  const [activeIndex, setActiveIndex] = useState(3);

  // Guard clause for empty data (AFTER hooks)
  if (!data || data.length === 0) {
    return null;
  }

  // Limit to 4 cards maximum
  const cities = data.slice(0, 4);

  return (
    <section className="py-12 bg-white relative">
      <div className="container mx-auto px-4 relative">
        <CornerDecorations />
        {/* Title Area - matching reference layout exactly */}
        <div className="text-center mb-12 title-area">
          <span
            className="sub-title block text-Nileblue mb-2"
            style={{
              fontFamily: 'var(--font-montez), cursive',
              fontSize: '40px',
              fontWeight: '400',
              textTransform: 'none',
            }}
          >
            Top Destination
          </span>
          <h2 className="sec-title text-2xl md:text-3xl font-bold text-Nileblue" style={{ fontFamily: 'var(--font-interTight), sans-serif', fontSize: '36px' }}>
            Our Featured Destination
          </h2>
        </div>

        {/* Flex container for expandable cards - Desktop */}
        <div className="hidden md:flex destination-list-area" style={{ gap: '24px' }}>
          {cities.map((city, index) => {
            const isActive = activeIndex === index;

            return (
              <div
                key={city.id || index}
                className={`destination-list-wrap ${isActive ? 'active' : ''}`}
                style={{
                  flex: isActive ? '3.5' : '1',
                  transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                  maxWidth: isActive ? '100%' : 'none',
                }}
              >
                <DestinationCard
                  city={city}
                  isActive={isActive}
                  onClick={() => {
                    setActiveIndex(index);
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Grid container for mobile - consistent card sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {cities.map((city, index) => (
            <div key={city.id || index} className="destination-list-wrap">
              <DestinationCard city={city} isActive={false} onClick={() => setActiveIndex(activeIndex === index ? null : index)} />
            </div>
          ))}
        </div>

        {/* View All Button - with arrow icon */}
        <div className="destination-btn text-center mt-12">
          <Link
            href="/destinations"
            className="th-btn style3 inline-flex items-center gap-2 px-8 py-3 bg-secondaryDark hover:bg-secondaryDark/90 text-white rounded-full font-medium transition-all group"
          >
            View All
            {/* Arrow icon - rotates on hover */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExpandableFeaturedDestinations;
