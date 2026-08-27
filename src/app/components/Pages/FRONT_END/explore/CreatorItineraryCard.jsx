'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

import ItemCard from '@/app/components/ui/item-card';
import { toggleItineraryLike } from '@/lib/actions/creatorItineraries';
import { mapCreatorItineraryToItemCard } from '@/lib/mapProductToItemCard';
import useAuthModalStore from '@/lib/store/useAuthModalStore';

const formatCount = (count) => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count;
};

export default function CreatorItineraryCard({ itinerary, isLoggedIn }) {
  const { openAuthModal } = useAuthModalStore();
  const [liked, setLiked] = useState(itinerary?.is_liked || false);
  const [likesCount, setLikesCount] = useState(itinerary?.likes_count || 0);
  const itineraryId = itinerary?.id;
  const card = mapCreatorItineraryToItemCard({ ...itinerary, likes_count: likesCount });

  const handleLike = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    if (!itineraryId) return;

    setLiked((previous) => !previous);
    setLikesCount((previous) => (liked ? previous - 1 : previous + 1));

    const result = await toggleItineraryLike(itineraryId);
    if (result.success) {
      setLiked(result.liked);
      setLikesCount(result.likes_count);
      return;
    }

    setLiked((previous) => !previous);
    setLikesCount((previous) => (liked ? previous + 1 : previous - 1));
  };

  return (
    <ItemCard
      {...card}
      variant="full"
      wishlistItem={null}
      cornerAction={
        <button
          type="button"
          onClick={handleLike}
          aria-label={`${liked ? 'Unlike' : 'Like'} ${card.title}. ${formatCount(likesCount)} likes`}
          className="weelp-creator-like-button grid size-11 place-items-center rounded-full border border-border bg-background text-weelp-discount shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-discount/50"
        >
          <Heart aria-hidden="true" className={`size-5 ${liked ? 'fill-current' : ''}`} />
        </button>
      }
    />
  );
}
