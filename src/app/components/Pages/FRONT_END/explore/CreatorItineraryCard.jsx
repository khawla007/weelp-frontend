'use client';

import { useState } from 'react';
import { Heart, Eye } from 'lucide-react';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import MediaImage from '@/app/components/MediaImage';
import { toggleItineraryLike, recordItineraryView } from '@/lib/actions/creatorItineraries';

const FALLBACK_COVER = '/assets/Card.webp';

const formatCount = (count) => {
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
  return count;
};

export default function CreatorItineraryCard({ itinerary, isLoggedIn, as: TitleTag = 'h3' }) {
  const [liked, setLiked] = useState(itinerary?.is_liked || false);
  const [likesCount, setLikesCount] = useState(itinerary?.likes_count || 0);
  const [viewsCount, setViewsCount] = useState(itinerary?.views_count || 0);

  const featuredMedia = itinerary?.media_gallery?.find((m) => m.is_featured)?.media?.url || itinerary?.media_gallery?.[0]?.media?.url;
  const initialCover = featuredMedia || itinerary?.featured_image || FALLBACK_COVER;
  const [coverSrc, setCoverSrc] = useState(initialCover);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const price = itinerary?.display_price;
  const currency = itinerary?.display_currency ?? '';
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
          <MediaImage
            src={coverSrc}
            alt={title}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            onError={() => setCoverSrc(FALLBACK_COVER)}
          />

          {/* Price overlay - slides up on hover */}
          {price && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
              <span className="text-white text-sm font-semibold">
                {currency} {Number(price).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </NavigationLink>

      {/* Engagement row */}
      <div className="px-2 pt-2 flex items-center gap-4">
        <button onClick={handleLike} className="text-[#71717a] flex items-center gap-1.5 text-sm">
          <Heart className={`size-4 ${liked ? 'text-[#ff725e] fill-[#ff725e]' : 'text-[#ff725e]'}`} />
          {formatCount(likesCount)}
        </button>
        <span className="text-[#71717a] flex items-center gap-1.5 text-sm">
          <Eye className="size-4 text-[#71717a]" />
          {formatCount(viewsCount)}
        </span>
      </div>

      {/* Title + creator avatar row */}
      <div className="px-2 pt-1 flex items-center justify-between">
        <TitleTag className="text-[#18181b] text-lg font-medium line-clamp-1 flex-1 mr-2">{title}</TitleTag>
        {creatorAvatar && !avatarBroken ? (
          <MediaImage
            src={creatorAvatar}
            alt={creatorName || 'creator'}
            width={36}
            height={36}
            sizes="36px"
            className="size-9 rounded-full object-cover flex-shrink-0"
            onError={() => setAvatarBroken(true)}
          />
        ) : (
          <span className="size-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor: '#588f7a' }}>
            {creatorInitials}
          </span>
        )}
      </div>
    </div>
  );
}
