'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';

import { useWishlistItems } from '@/hooks/api/customer/wishlist';
import { useToast } from '@/hooks/use-toast';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { normalizeWishlistPayload } from '@/lib/wishlist/normalizeWishlistItem';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

function isSameWishlistItem(item, payload) {
  return String(item?.item_type) === String(payload?.item_type) && String(item?.item_id) === String(payload?.item_id);
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Please try again.';
}

export default function WishlistButton({ item, className = '' }) {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModalStore();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const payload = useMemo(() => normalizeWishlistPayload(item), [item]);
  const { items, isLoading, addItem, removeItemByIdentity } = useWishlistItems({ enabled: status === 'authenticated' });
  const isSaved = useMemo(() => Boolean(payload && items.some((wishlistItem) => isSameWishlistItem(wishlistItem, payload))), [items, payload]);

  const runWishlistAction = useCallback(
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
    if (!payload || status === 'loading' || isPending || (status === 'authenticated' && isLoading)) return;

    if (!session?.user) {
      openAuthModal({
        onSuccess: async () => {
          await runWishlistAction(false);
        },
      });
      return;
    }

    void runWishlistAction(isSaved);
  };

  const title = payload?.title || 'item';
  const action = isSaved ? 'Remove' : 'Save';
  const isDisabled = !payload || status === 'loading' || isPending || (status === 'authenticated' && isLoading);
  const heartClassName = isSaved ? 'fill-destructive text-destructive' : 'fill-transparent text-copy';

  return (
    <button
      type="button"
      aria-label={`${action} ${title} ${isSaved ? 'from' : 'to'} wishlist`}
      aria-pressed={isSaved}
      onClick={handleClick}
      disabled={isDisabled}
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-base font-medium text-copy transition-colors hover:border-weelp-sage-deep hover:bg-weelp-sage-deep/5 hover:text-weelp-sage-text disabled:cursor-not-allowed disabled:opacity-60 ${focusRing} ${className}`}
    >
      <Heart data-testid="wishlist-heart" aria-hidden="true" className={`size-[18px] transition-colors ${heartClassName}`} />
      {isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
    </button>
  );
}
