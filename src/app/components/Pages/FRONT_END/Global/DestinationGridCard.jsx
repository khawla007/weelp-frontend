'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const DestinationGridCard = ({ city, isActive = false }) => {
  if (!city) return null;

  // Debug: log the city data
  console.log('City data:', city);

  // Get the full image URL
  const getImgUrl = (imgPath) => {
    if (!imgPath) {
      console.log('No image path provided');
      return '/assets/images/destination-placeholder.jpg';
    }
    // If already a full URL, return as is
    if (imgPath.startsWith('http')) return imgPath;
    // Otherwise prepend backend URL
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/';
    const fullUrl = `${baseUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
    console.log('Image URL constructed:', fullUrl);
    return fullUrl;
  };

  const imageUrl = getImgUrl(city.feature_image || city.featured_image || city.image);

  return (
    <div className={`relative group overflow-hidden rounded-xl ${isActive ? 'ring-2 ring-secondaryDark' : ''}`}>
      {/* Background Image */}
      <div className="relative h-64 sm:h-72 w-full">
        <img
          src={imageUrl}
          alt={city.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Link href={`/city/${city.slug}`}>
          <h3 className="text-xl font-semibold text-white hover:text-secondarylight transition-colors">
            {city.name}
          </h3>
        </Link>
        <span className="text-sm text-white/80">
          {city.activities_count || 0} Listing
        </span>
      </div>

      {/* Book Now Button */}
      <Link
        href={`/city/${city.slug}`}
        className="absolute bottom-4 right-4 px-4 py-2 bg-secondaryDark hover:bg-secondaryLight text-white text-sm font-medium rounded-lg transition-colors"
      >
        Book Now
      </Link>
    </div>
  );
};

export default DestinationGridCard;
