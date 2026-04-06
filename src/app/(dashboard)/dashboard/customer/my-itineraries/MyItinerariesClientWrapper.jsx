'use client';

import { useState } from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavigationLink from '@/app/components/Navigation/NavigationLink';

export default function MyItinerariesClientWrapper({ initialItineraries, lastPage }) {
  const [itineraries] = useState(initialItineraries);

  if (itineraries.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#142A38]">No itineraries yet</p>
        <p className="text-[#5A5A5A] mt-2">Browse and save itineraries from the explore page to see them here.</p>
        <NavigationLink href="/explore">
          <Button className="mt-4 bg-secondaryDark hover:bg-secondaryDark/90">Explore Itineraries</Button>
        </NavigationLink>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {itineraries.map((item) => {
        const itinerary = item.itinerary || item;
        const featuredImage = itinerary.featured_image || itinerary.image || '/assets/images/placeholder-itinerary.jpg';
        const name = itinerary.name || itinerary.title || 'Untitled Itinerary';
        const city = itinerary.city?.name || itinerary.city_name || '';
        const dayCount = itinerary.day_count || itinerary.days_count || itinerary.schedules?.length || 0;
        const slug = itinerary.slug;

        return (
          <div key={item.id || itinerary.id} className="bg-white rounded-lg border border-[#435a6742] overflow-hidden group">
            <div className="aspect-video bg-[#CFDBE54D] relative overflow-hidden">
              <img
                src={featuredImage}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/assets/images/placeholder-itinerary.jpg';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[#142A38] text-base line-clamp-1 mb-2">{name}</h3>
              <div className="flex items-center gap-4 text-sm text-[#5A5A5A] mb-4">
                {city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {city}
                  </span>
                )}
                {dayCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {dayCount} {dayCount === 1 ? 'Day' : 'Days'}
                  </span>
                )}
              </div>
              {slug ? (
                <NavigationLink href={`/itineraries/${slug}`} className="block">
                  <Button variant="outline" size="sm" className="w-full border-[#435a6742] text-[#435a67] hover:bg-[#CFDBE54D]">
                    View & Book
                  </Button>
                </NavigationLink>
              ) : (
                <Button variant="outline" size="sm" disabled className="w-full border-[#435a6742] text-[#435a67]">
                  View & Book
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
