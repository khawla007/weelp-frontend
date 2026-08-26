'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
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

export default function ItemCardWishlistButton({ item }) {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModalStore();
  const { toast } = useToast();
  const pendingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const payload = useMemo(() => normalizeWishlistPayload(item), [item]);
  const isAuthenticated = status === 'authenticated';
  const { items, isLoading, addItem, removeItemByIdentity } = useWishlistItems({ enabled: Boolean(payload) && isAuthenticated });
  const isSaved = useMemo(() => Boolean(payload && Array.isArray(items) && items.some((wishlistItem) => isSameWishlistItem(wishlistItem, payload))), [items, payload]);

  const updateWishlist = useCallback(
    async (removeSavedItem) => {
      if (!payload || pendingRef.current) return;

      pendingRef.current = true;
      setIsPending(true);
      try {
        if (removeSavedItem) {
          await removeItemByIdentity(payload.item_type, payload.item_id);
          toast({ title: 'Removed from wishlist', description: `${payload.title || 'This item'} has been removed from your wishlist.` });
        } else {
          await addItem(payload);
          toast({ title: 'Saved to wishlist', description: `${payload.title || 'This item'} has been added to your wishlist.` });
        }
      } catch (error) {
        toast({ title: 'Unable to update wishlist', description: getErrorMessage(error), variant: 'destructive' });
      } finally {
        pendingRef.current = false;
        setIsPending(false);
      }
    },
    [addItem, payload, removeItemByIdentity, toast],
  );

  if (!payload) return null;

  const handleClick = () => {
    if (status === 'loading' || pendingRef.current || (isAuthenticated && isLoading)) return;
    if (!session?.user) {
      openAuthModal({ onSuccess: (authenticatedSession) => (authenticatedSession?.user ? updateWishlist(false) : undefined) });
      return;
    }
    void updateWishlist(isSaved);
  };

  const title = payload.title || 'item';
  const isDisabled = status === 'loading' || isPending || (isAuthenticated && isLoading);

  return (
    <button
      type="button"
      aria-label={`${isSaved ? 'Remove' : 'Save'} ${title} ${isSaved ? 'from' : 'to'} wishlist`}
      aria-pressed={isSaved}
      onClick={handleClick}
      disabled={isDisabled}
      className="grid size-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        data-testid="item-card-wishlist-visual"
        className="grid size-8 place-items-center rounded-full bg-background/90 text-destructive shadow-sm backdrop-blur-md transition-transform hover:scale-[1.04] motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <Heart aria-hidden="true" className={`size-[1.2rem] ${isSaved ? 'fill-current' : ''}`} />
      </span>
    </button>
  );
}
