'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';

import { useWishlistItems } from '@/hooks/api/customer/wishlist';
import { useToast } from '@/hooks/use-toast';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { normalizeWishlistPayload } from '@/lib/wishlist/normalizeWishlistItem';

function isSameWishlistItem(item, payload) {
  return String(item?.item_type) === String(payload?.item_type) && String(item?.item_id) === String(payload?.item_id);
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Please try again.';
}

export default function GoldActivityWishlistButton({ item }) {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModalStore();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const payload = useMemo(() => normalizeWishlistPayload(item), [item]);
  const isAuthenticated = status === 'authenticated';
  const { items, isLoading, addItem, removeItemByIdentity } = useWishlistItems({ enabled: isAuthenticated });
  const isSaved = useMemo(() => Boolean(payload && items.some((wishlistItem) => isSameWishlistItem(wishlistItem, payload))), [items, payload]);
  const isDisabled = !payload || status === 'loading' || isPending || (isAuthenticated && isLoading);

  const updateWishlist = useCallback(
    async (removeSavedItem) => {
      if (!payload || isPending) return;

      setIsPending(true);
      try {
        if (removeSavedItem) {
          await removeItemByIdentity(payload.item_type, payload.item_id);
          toast({
            title: 'Removed from wishlist',
            description: `${payload.title || 'This item'} has been removed from your wishlist.`,
          });
        } else {
          await addItem(payload);
          toast({
            title: 'Saved to wishlist',
            description: `${payload.title || 'This item'} has been added to your wishlist.`,
          });
        }
      } catch (error) {
        toast({
          title: 'Unable to update wishlist',
          description: getErrorMessage(error),
          variant: 'destructive',
        });
      } finally {
        setIsPending(false);
      }
    },
    [addItem, isPending, payload, removeItemByIdentity, toast],
  );

  const handleClick = () => {
    if (isDisabled) return;

    if (!session?.user) {
      openAuthModal({
        onSuccess: (authenticatedSession) => {
          if (!authenticatedSession?.user) return;
          return updateWishlist(false);
        },
      });
      return;
    }

    void updateWishlist(isSaved);
  };

  const title = payload?.title || 'activity';

  return (
    <button
      type="button"
      aria-label={`${isSaved ? 'Remove' : 'Save'} ${title} ${isSaved ? 'from' : 'to'} wishlist`}
      aria-pressed={isSaved}
      onClick={handleClick}
      disabled={isDisabled}
      className="grid size-8 place-items-center rounded-full bg-[oklch(0.97_0.015_80/0.88)] text-[oklch(0.55_0.2_28)] shadow-sm backdrop-blur-md transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/50 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:scale-100 dark:bg-[oklch(0.2_0.035_155/0.9)] dark:text-white"
    >
      <Heart aria-hidden="true" className={`size-4 ${isSaved ? 'fill-current' : ''}`} />
    </button>
  );
}
