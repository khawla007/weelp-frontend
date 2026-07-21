'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import BreadCrumb from '@/app/components/BreadCrumb';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { CircleCheckBig, Clock4, MapPin, Star, Heart } from 'lucide-react';
import GallerySlider from '@/app/components/sliders/GallerySlider';
import { useToast } from '@/hooks/use-toast';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { addWishlistItem } from '@/lib/services/customer/wishlist';
import { normalizeWishlistPayload } from '@/lib/wishlist/normalizeWishlistItem';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const BannerSection = ({
  activityName,
  media_gallery = [],
  reviewSummary = null,
  primaryLocation = null,
  city = null,
  scheduleDisplay = null,
  itemId = null,
  itemType = null,
  slug = null,
  citySlug = null,
  cityName = null,
  price = null,
  currency = null,
}) => {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModalStore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const wishlistItem = useMemo(
    () => ({
      id: itemId,
      type: itemType,
      title: activityName,
      slug,
      citySlug,
      cityName,
      price,
      currency,
    }),
    [activityName, cityName, citySlug, currency, itemId, itemType, price, slug],
  );

  const saveWishlistItem = useCallback(async () => {
    const payload = normalizeWishlistPayload(wishlistItem);

    if (!payload) {
      toast({
        title: 'Unable to save wishlist item',
        description: 'This item is missing required wishlist details.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      await addWishlistItem(payload);
      toast({
        title: 'Saved to wishlist',
        description: `${activityName || 'This item'} has been added to your wishlist.`,
      });
    } catch (error) {
      toast({
        title: 'Unable to save wishlist item',
        description: error?.response?.data?.message || error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [activityName, toast, wishlistItem]);

  const handleSaveClick = () => {
    if (status === 'loading' || isSaving) return;

    if (!session?.user) {
      openAuthModal({ onSuccess: saveWishlistItem });
      return;
    }

    saveWishlistItem();
  };

  const isSaveDisabled = status === 'loading' || isSaving;

  return (
    <section className="weelp-hero-rise bg-background mb-10 md:mb-16 lg:mb-24">
      <div className="max-w-pen mx-auto bg-background px-4">
        {/* Breadcrumb + Title + Stats */}
        <div className="flex flex-col gap-2 pt-6 md:pt-[70px]">
          <div className="weelp-hero-ui-rise" style={{ '--weelp-motion-delay': '120ms' }}>
            <BreadCrumb className="mb-2" />
          </div>

          <h1 className="text-foreground text-2xl lg:text-[38px] capitalize">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
                {activityName ?? 'Melaka Wonderland Water Theme Park Ticket'}
              </span>
            </span>
          </h1>

          {/* Stats Row + Save to Wishlist */}
          <div className="weelp-hero-ui-rise flex flex-wrap items-center justify-between pb-4" style={{ '--weelp-motion-delay': '280ms' }}>
            <ul className="flex flex-wrap items-center gap-4">
              <li className="flex items-center gap-2 pr-4 border-r border-border">
                <span className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className={i < Math.round(reviewSummary?.average_rating || 0) ? 'stroke-none fill-warning' : 'stroke-none fill-muted-foreground/60'} size={16} />
                    ))}
                </span>
                <span className="text-muted-foreground text-sm lg:text-base font-medium">{reviewSummary?.total_reviews || 0} Reviews</span>
              </li>
              <li className="flex items-center gap-2 pr-4 border-r border-border">
                <CircleCheckBig size={18} className="text-muted-foreground" />
                <span className="text-muted-foreground text-sm lg:text-base font-medium">3M+ booked</span>
              </li>
              <li className="flex items-center gap-2 pr-4 border-r border-border">
                <MapPin size={18} className="text-muted-foreground" />
                <NavigationLink href={`/cities/${city || '#'}`} className={`text-muted-foreground text-sm lg:text-base font-medium hover:text-foreground transition-colors rounded-sm ${focusRing}`}>
                  {primaryLocation?.city || 'Location'} {primaryLocation?.location_label && `(${primaryLocation.location_label})`}
                </NavigationLink>
              </li>
              <li className="flex items-center gap-2">
                <Clock4 size={18} className="text-muted-foreground" />
                <span className="text-muted-foreground text-sm lg:text-base font-medium">{scheduleDisplay || (primaryLocation?.duration ? `${primaryLocation.duration} Minutes` : 'Flexible')}</span>
              </li>
            </ul>

            {/* Save to Wishlist — desktop only */}
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaveDisabled}
              className={`hidden lg:flex items-center gap-2 text-copy hover:text-foreground font-medium text-base rounded-sm px-1 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
            >
              <Heart size={18} />
              Save to Wishlist
            </button>
          </div>

          {/* Separator */}
          <div className="border-b border-border" />
        </div>

        {/* Image Gallery */}
        {media_gallery?.length > 0 && (
          <div className="weelp-hero-ui-rise mt-6" style={{ '--weelp-motion-delay': '360ms' }}>
            <GallerySlider data={media_gallery} collapseHiddenThumbnails />
          </div>
        )}
      </div>
    </section>
  );
};

export default BannerSection;
