'use client';

import { useState } from 'react';
import { Heart, Eye } from 'lucide-react';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { toggleItineraryLike, recordItineraryView } from '@/lib/actions/creatorItineraries';

const formatCount = (count) => {
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
  return count;
};

export default function CreatorItineraryCard({ itinerary, isLoggedIn }) {
  const [liked, setLiked] = useState(itinerary?.is_liked || false);
  const [likesCount, setLikesCount] = useState(itinerary?.likes_count || 0);
  const [viewsCount, setViewsCount] = useState(itinerary?.views_count || 0);

  const featuredMedia = itinerary?.media_gallery?.find((m) => m.is_featured)?.media?.url || itinerary?.media_gallery?.[0]?.media?.url;
  const featuredImage = featuredMedia || itinerary?.featured_image || '/assets/Card.webp';
  const price = itinerary?.display_price;
  const currency = itinerary?.currency || 'USD';
  const title = itinerary?.name || 'Untitled Itinerary';
  const slug = itinerary?.slug;

  const creatorName = itinerary?.creator?.name || '';
  const creatorAvatar = itinerary?.creator?.avatar_media?.url || itinerary?.creator?.profile?.avatar || '';
  const creatorInitials = (() => {
    if (!creatorName) return 'U';
    const parts = creatorName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  })();

  const cityName = itinerary?.locations?.[0]?.city?.name || '';
  const citySlug = cityName ? cityName.toLowerCase().replace(/\s+/g, '-') : '';
  const href = citySlug && slug ? `/cities/${citySlug}/itineraries/${slug}` : '#';

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;

    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    const result = await toggleItineraryLike(itinerary.id);
    if (result.success) {
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } else {
      // Revert on failure
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  const handleCardClick = async () => {
    try {
      const result = await recordItineraryView(itinerary.id);
      if (result.success) {
        setViewsCount(result.views_count);
      }
    } catch {
      // Non-blocking
    }
  };

  return (
    <div className="w-full max-w-full sm:max-w-sm">
      {/* Image with price overlay */}
      <NavigationLink href={href} onClick={handleCardClick}>
        <div className="group relative w-full aspect-[93/100] overflow-hidden rounded-lg">
          <img
            src={featuredImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/assets/Card.webp';
            }}
          />

          {/* Price overlay - slides up on hover */}
          {price && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
              <span className="text-white text-sm font-semibold">
                {currency} {price}
              </span>
            </div>
          )}
        </div>
      </NavigationLink>

      {/* Engagement row */}
      <div className="px-2 pt-2 flex items-center gap-4">
        <button onClick={handleLike} className="text-[#5A5A5A] flex items-center gap-1.5 text-sm">
          <Heart className={`size-4 ${liked ? 'text-[#FF8686] fill-[#FF8686]' : 'text-[#FF8686]'}`} />
          {formatCount(likesCount)}
        </button>
        <span className="text-[#5A5A5A] flex items-center gap-1.5 text-sm">
          <Eye className="size-4 text-[#5A5A5A]" />
          {formatCount(viewsCount)}
        </span>
      </div>

      {/* Title + creator avatar row */}
      <div className="px-2 pt-1 flex items-center justify-between">
        <h3 className="text-[#142A38] text-lg font-medium line-clamp-1 flex-1 mr-2">{title}</h3>
        {creatorAvatar ? (
          <img src={creatorAvatar} alt={creatorName || 'creator'} className="size-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <span
            className="size-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ backgroundColor: '#568f7c' }}
          >
            {creatorInitials}
          </span>
        )}
      </div>
    </div>
  );
}
