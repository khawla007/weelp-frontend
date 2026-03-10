'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const ExpandableFeaturedDestinations = ({ data = [], title = 'Top Destinations' }) => {
  // Guard clause for empty data
  if (!data || data.length === 0) {
    return null;
  }

  // State: track clicked (locked) and hovered card
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

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
        aria-label={`View ${city.name} destinations`}
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
          alt={city.name}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Region Name (if exists) */}
          {city.region && (
            <span className="text-xs uppercase tracking-wider text-white/70 mb-1 block">
              {city.region}
            </span>
          )}

          {/* City Name */}
          <Link href={`/city/${city.slug}`}>
            <h3 className="text-2xl md:text-3xl font-bold text-white hover:text-secondarylight transition-colors">
              {city.name}
            </h3>
          </Link>

          {/* Activity Count (if exists) */}
          {city.activities_count !== undefined && city.activities_count !== null && (
            <span className="flex items-center gap-1 text-white/90 mt-1">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              {city.activities_count} Activities
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

        {/* Flex container for expandable cards - will be implemented in next tasks */}
        <div className="flex gap-2">
          {/* Cards placeholder */}
        </div>
      </div>
    </section>
  );
};

export default ExpandableFeaturedDestinations;
