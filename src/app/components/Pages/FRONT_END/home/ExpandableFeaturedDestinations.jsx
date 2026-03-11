'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const ExpandableFeaturedDestinations = ({ data = [], title = 'Top Destinations' }) => {
  // State: track clicked (locked) and hovered card (MUST BE FIRST - React Hooks Rules)
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  // Guard clause for empty data (AFTER hooks)
  if (!data || data.length === 0) {
    return null;
  }

  // Limit to 4 cards maximum
  const cities = data.slice(0, 4);

  // Helper function to construct full image URL
  const getImgUrl = (imgPath) => {
    if (!imgPath) {
      return '/assets/images/destination-placeholder.jpg';
    }
    if (imgPath.startsWith('http')) return imgPath;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/';
    return `${baseUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  // Inner card component
  const DestinationCard = ({ city, isActive, isHovered, onClick, onMouseEnter, onMouseLeave }) => {
    const imageUrl = getImgUrl(city.feature_image || city.featured_image || city.image);

    return (
      <div
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`
          relative overflow-hidden rounded-xl cursor-pointer
          transition-all duration-400 ease-out
          // Mobile: grid (no animation)
          md:flex
          // Flex behavior: normal vs expanded
          ${isActive || isHovered ? 'flex-[3_1_300%]' : 'flex-[1_1_100%]'}
          // Minimum height
          min-h-[300px]
        `}
        // Accessibility
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
        <img
          src={imageUrl}
          alt={city.name || 'Destination'}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* State/Region Name (if exists) */}
          {city.state?.name && (
            <span className="text-xs uppercase tracking-wider text-white/70 mb-1 block">
              {city.state.name}
            </span>
          )}

          {/* City Name */}
          <Link href={`/city/${city.slug || city.id}`}>
            <h3 className="text-2xl md:text-3xl font-bold text-white hover:text-secondarylight transition-colors">
              {city.name || 'Unknown Destination'}
            </h3>
          </Link>

          {/* Activity Count (if exists) */}
          {city.activities_count !== undefined && city.activities_count !== null && (
            <span className="flex items-center gap-1 text-white/90 mt-1">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              {city.activities_count} {city.activities_count === 1 ? 'Activity' : 'Activities'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Title Area */}
        <div className="text-center mb-8">
          <span className="text-sm font-medium text-secondaryDark uppercase tracking-wider">
            Explore
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-Nileblue mt-2">
            {title}
          </h2>
        </div>

        {/* Flex container for expandable cards - Desktop */}
        <div className="hidden md:flex gap-2">
          {cities.map((city, index) => {
            const isHovered = hoverIndex === index && activeIndex === null;
            const isActive = activeIndex === index;

            return (
              <DestinationCard
                key={city.id || index}
                city={city}
                isActive={isActive}
                isHovered={isHovered}
                onClick={() => {
                  // Toggle: if clicking active, deselect; otherwise select
                  setActiveIndex(activeIndex === index ? null : index);
                }}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}
        </div>

        {/* Grid container for mobile */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {cities.map((city, index) => (
            <DestinationCard
              key={city.id || index}
              city={city}
              isActive={false}
              isHovered={false}
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpandableFeaturedDestinations;
