'use client';

import { useState } from 'react';
import { Heart, Eye } from 'lucide-react';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import MediaImage from '@/app/components/MediaImage';
import { toggleItineraryLike } from '@/lib/actions/creatorItineraries';
import useAuthModalStore from '@/lib/store/useAuthModalStore';

const FALLBACK_COVER = '/assets/Card.webp';

const formatCount = (count) => {
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
  return count;
};

export default function CreatorItineraryCard({ itinerary, isLoggedIn, as: TitleTag = 'h3' }) {
  const { openAuthModal } = useAuthModalStore();
  const [liked, setLiked] = useState(itinerary?.is_liked || false);
  const [likesCount, setLikesCount] = useState(itinerary?.likes_count || 0);

  const featuredMedia = itinerary?.media_gallery?.find((m) => m.is_featured)?.media?.url || itinerary?.media_gallery?.[0]?.media?.url;
  const initialCover = featuredMedia || itinerary?.featured_image || FALLBACK_COVER;
  const [coverSrc, setCoverSrc] = useState(initialCover);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const price = itinerary?.display_price;
  const currency = itinerary?.display_currency ?? '';
  const title = itinerary?.name || 'Untitled Itinerary';
  const slug = itinerary?.slug;
  const itineraryId = itinerary?.id;

  const creatorName = itinerary?.creator?.name || '';
  const creatorAvatar = itinerary?.creator?.avatar_media?.url || itinerary?.creator?.profile?.avatar || '';
  const creatorInitials = (() => {
    if (!creatorName) return 'U';
    const parts = creatorName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  })();

  const city = itinerary?.locations?.[0]?.city;
  const citySlug = city?.slug || (city?.name ? city.name.toLowerCase().replace(/\s+/g, '-') : '');
  const href = citySlug && slug ? `/cities/${citySlug}/itineraries/${slug}` : '#';

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    if (!itineraryId) return;

    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    const result = await toggleItineraryLike(itineraryId);
    if (result.success) {
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } else {
      // Revert on failure
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  return (
    <div className="flex h-full w-full max-w-full flex-col overflow-hidden rounded-xl border border-border bg-background transition-[transform,box-shadow] duration-200 ease-[var(--weelp-ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--weelp-card-hover-shadow)] focus-within:-translate-y-0.5 focus-within:shadow-[var(--weelp-card-hover-shadow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-within:translate-y-0">
      {/* Image with price overlay */}
      <NavigationLink href={href} className="block">
        <div className="group/image relative aspect-[4/3] w-full overflow-hidden sm:aspect-[93/100]">
          <MediaImage
            src={coverSrc}
            alt={title}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            onError={() => setCoverSrc(FALLBACK_COVER)}
          />

          {/* Price overlay - slides up on hover */}
          {price && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-3 py-2 transition-transform duration-300 group-hover/image:translate-y-0">
              <span className="text-white text-sm font-semibold">
                {currency} {Number(price).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </NavigationLink>

      <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-2.5">
        {/* Engagement row */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            aria-label={`${liked ? 'Unlike' : 'Like'} ${title}. ${formatCount(likesCount)} likes`}
            className="weelp-creator-like-button -m-1 flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md border-0 bg-transparent p-1 text-sm text-muted-foreground shadow-none transition-[color,box-shadow,transform] duration-200 hover:shadow-[0_4px_14px_hsl(var(--weelp-discount)/0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-discount/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <Heart className={`size-4 ${liked ? 'text-weelp-discount fill-weelp-discount' : 'text-weelp-discount'}`} />
            {formatCount(likesCount)}
          </button>
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Eye className="size-4 text-muted-foreground" />
            {formatCount(itinerary?.views_count || 0)}
          </span>
        </div>

        {/* Title + creator avatar row */}
        <div className="flex min-w-0 items-center justify-between gap-3">
          <TitleTag className="line-clamp-2 min-w-0 flex-1 text-base font-medium leading-snug text-foreground sm:text-lg">{title}</TitleTag>
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
            <span className="size-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor: 'hsl(var(--weelp-sage-deep))' }}>
              {creatorInitials}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
