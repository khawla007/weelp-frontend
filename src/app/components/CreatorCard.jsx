'use client';

import { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { toggleLike, incrementShare } from '@/lib/actions/posts';

export const CreatorCard = ({ post, isAuthenticated = false }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [sharesCount, setSharesCount] = useState(post?.shares_count || 0);

  const creatorId = post?.creator?.id;
  const mediaUrl = post?.media?.url
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL ? '' : ''}${post.media.url}`
    : '/assets/Card.webp';
  const creatorAvatar = post?.creator?.avatar_media?.url || '/assets/Card.webp';
  const firstTaggedItem = post?.tagged_items?.[0];

  const getItemHref = (item) => {
    if (!item?.taggable) return '#';
    const taggable = item.taggable;
    const slug = taggable.slug;
    const type = item.taggable_type;

    if (type === 'App\\Models\\Activity') return `/cities/activity/${slug}?ref=${creatorId}`;
    if (type === 'App\\Models\\Itinerary') return `/cities/itinerary/${slug}?ref=${creatorId}`;
    if (type === 'App\\Models\\Package') return `/cities/package/${slug}?ref=${creatorId}`;
    return '#';
  };

  const getItemLabel = (item) => {
    if (!item?.taggable) return '';
    const type = item.taggable_type;
    if (type === 'App\\Models\\Activity') return 'Activity';
    if (type === 'App\\Models\\Itinerary') return 'Itinerary';
    if (type === 'App\\Models\\Package') return 'Package';
    return '';
  };

  const mainHref = firstTaggedItem ? getItemHref(firstTaggedItem) : '#';

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;

    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    const result = await toggleLike(post.id);
    if (result.success) {
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } else {
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}${mainHref}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSharesCount((prev) => prev + 1);
      await incrementShare(post.id);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const formatCount = (count) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count;
  };

  return (
    <div className="w-full max-w-full sm:max-w-sm p-4 sm:p-6">
      <NavigationLink href={mainHref}>
        <div className="relative w-full aspect-[93/100]">
          <Image
            src={mediaUrl}
            alt={post?.caption || 'Creator post'}
            fill
            className="rounded-lg object-cover"
          />
        </div>
      </NavigationLink>

      <div className="px-2 flex justify-between items-center pt-2">
        <div className="flex flex-col gap-[3px]">
          <div className="flex gap-4">
            <button onClick={handleLike} className="text-[#5A5A5A] flex items-center gap-2 text-sm">
              <Heart className={`size-4 ${liked ? 'text-[#FF8686] fill-[#FF8686]' : 'text-[#FF8686]'}`} />
              {formatCount(likesCount)}
            </button>
            <button onClick={handleShare} className="text-[#5A5A5A] flex items-center gap-2 text-sm">
              <Share2 className="size-4 text-[#5A5A5A]" />
              {formatCount(sharesCount)}
            </button>
          </div>
          <h3 className="text-[#142A38] text-lg font-medium line-clamp-1">
            {post?.caption || 'Untitled Post'}
          </h3>
        </div>
        <div className="flex items-center">
          <Image
            src={creatorAvatar}
            className="size-11 rounded-full object-cover"
            width={44}
            height={44}
            alt={post?.creator?.name || 'Creator'}
          />
        </div>
      </div>

      {/* Tagged Item Badges */}
      {post?.tagged_items?.length > 0 && (
        <div className="px-2 pt-2 flex flex-wrap gap-2">
          {post.tagged_items.map((item) => (
            <NavigationLink
              key={item.id}
              href={getItemHref(item)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-[#CFDBE54D] text-grayDark hover:bg-secondaryDark hover:text-white transition-colors"
            >
              {item.taggable?.name || getItemLabel(item)}
            </NavigationLink>
          ))}
        </div>
      )}
    </div>
  );
};
