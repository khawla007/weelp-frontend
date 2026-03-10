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
