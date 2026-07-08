'use client';

import React, { useCallback, useState } from 'react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChevronDown, Heart, X } from 'lucide-react';
import BreakSection from '../BreakSection';
import MiniCartProductCard from '../MiniCartProductCard';
import { MinicartReviewcontent } from '../MiniCartReviewCard';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { addWishlistItem } from '@/lib/services/customer/wishlist';
import { normalizeWishlistPayload } from '@/lib/wishlist/normalizeWishlistItem';
import { buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

const MiniCartNew = () => {
  const router = useRouter(); // intialize route
  const { status } = useSession();
  const { toast } = useToast();
  const { openAuthModal } = useAuthModalStore();
  const { cartItems, totalPrice, isMiniCartOpen, setMiniCartOpen, clearCart } = useMiniCartStore();
  const cartCurrency = cartItems?.[0]?.currency || 'USD';
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [isSavingCart, setIsSavingCart] = useState(false);

  const saveCartToWishlist = useCallback(async () => {
    if (!cartItems?.length || isSavingCart) return;

    const wishlistPayloads = cartItems.map((item) => normalizeWishlistPayload(item));

    if (wishlistPayloads.some((payload) => !payload)) {
      toast({
        title: 'Could not save cart',
        description: 'One or more cart items cannot be saved to your wishlist.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingCart(true);

    try {
      await Promise.all(wishlistPayloads.map((payload) => addWishlistItem(payload)));
      clearCart();
      setMiniCartOpen(false);
      toast({
        title: 'Cart saved to wishlist',
        description: 'Every item in your cart was moved to your wishlist.',
      });
    } catch {
      toast({
        title: 'Could not save cart',
        description: 'Your cart was not changed. Please try saving it again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingCart(false);
    }
  }, [cartItems, clearCart, isSavingCart, setMiniCartOpen, toast]);

  const handleSaveCart = useCallback(() => {
    if (status === 'loading' || isSavingCart) return;

    if (status !== 'authenticated') {
      openAuthModal({
        onSuccess: () => {
          void saveCartToWishlist();
        },
      });
      return;
    }

    void saveCartToWishlist();
  }, [isSavingCart, openAuthModal, saveCartToWishlist, status]);

  return (
    <Sheet open={isMiniCartOpen} onOpenChange={setMiniCartOpen}>
      <SheetContent className="w-full !max-w-full p-0 bg-muted shadow-xl sm:!max-w-[485px]">
        <SheetHeader>
          <SheetTitle className="sr-only">MiniCart</SheetTitle>
          <SheetDescription className="sr-only"></SheetDescription>
        </SheetHeader>

        <div className="w-full h-full bg-inherit">
          {cartItems && cartItems.length > 0 ? (
            // if data exist
            <div className="flex h-full min-h-full flex-col overflow-y-auto px-3 pb-4 pt-3 tfc_scroll group sm:px-8 sm:pt-6">
              <X
                onClick={() => setMiniCartOpen(!isMiniCartOpen)}
                className="absolute right-3 top-3 z-10 size-9 cursor-pointer rounded-full bg-muted-foreground p-2 text-background duration-200 ease-in-out sm:left-1/2 sm:right-auto sm:top-2 sm:size-10 sm:-translate-y-12 sm:group-hover:translate-y-0"
              />
              <div className="mt-1 flex items-center justify-between pr-11 sm:mt-4 sm:pr-0">
                <h3 className="text-xl font-bold text-Blueish sm:text-2xl">Your Cart</h3>
                <button
                  type="button"
                  aria-label="Save cart to wishlist"
                  onClick={handleSaveCart}
                  disabled={isSavingCart || status === 'loading'}
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-copy transition-colors hover:bg-muted-foreground/10 hover:text-weelp-sage-deep disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                >
                  <Heart size={18} aria-hidden="true" />
                  {isSavingCart ? 'Saving...' : 'Save cart'}
                </button>
              </div>

              <BreakSection marginTop={'my-3 sm:my-4'} />

              <div className="flex min-h-0 flex-1 flex-col justify-between">
                {/* From  ->  To */}
                <div className="flex flex-col gap-3 rounded-xl shadow-sm sm:gap-4">
                  {cartItems.map((val, index) => {
                    return (
                      <MiniCartProductCard
                        key={index}
                        itemId={val?.id}
                        itemType={val?.type}
                        productName={val?.name}
                        productImage={val?.image || val?.featured_image}
                        howMany={val?.howMany}
                        dateRange={val?.dateRange}
                        addons={val?.addons || []}
                        currency={val?.currency}
                        perPersonPrice={val?.per_person_price}
                        perPaxTotal={val?.per_pax_total}
                        flatTotal={val?.flat_total}
                        headcount={val?.headcount}
                        addonsTotal={val?.addons_total}
                        totalPrice={val?.price}
                        onClose={() => setMiniCartOpen(false)}
                      />
                    );
                  })}
                </div>
                <MinicartReviewcontent />

                {/* Payments */}
                <div className="sticky bottom-0 z-10 -mx-3 mt-3 flex flex-col bg-muted px-3 pb-2 pt-1 sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:pb-0">
                  <BreakSection marginTop={'my-3 sm:my-4'} />

                  {breakdownOpen && (
                    <div className="mb-3 max-h-56 space-y-4 overflow-y-auto rounded-lg border border-border bg-card p-3 text-sm text-copy shadow-sm sm:max-h-72 sm:p-4">
                      {cartItems.map((item) => {
                        const cur = item?.currency || cartCurrency;
                        const isItin = item?.type === 'itinerary';
                        const perPerson = Number(item?.per_person_price ?? item?.per_pax_total ?? 0);
                        const guests = Number(item?.headcount ?? Number(item?.howMany?.adults || 0) + Number(item?.howMany?.children || 0)) || 1;
                        const flat = Number(item?.flat_total ?? 0);
                        const addonsSum = Number(item?.addons_total ?? 0);
                        const subtotal = Number(item?.price ?? 0);
                        return (
                          <div key={item?.id} className="space-y-1">
                            <p className="text-Blueish font-semibold capitalize">{item?.name ?? item?.type}</p>
                            {isItin && perPerson > 0 && (
                              <div className="flex justify-between">
                                <span>
                                  {formatCurrency(perPerson, cur)} × {guests} {guests === 1 ? 'guest' : 'guests'}
                                </span>
                                <span>{formatCurrency(perPerson * guests, cur)}</span>
                              </div>
                            )}
                            {isItin && flat > 0 && (
                              <div className="flex justify-between">
                                <span>Per-vehicle / extras</span>
                                <span>{formatCurrency(flat, cur)}</span>
                              </div>
                            )}
                            {addonsSum > 0 && (
                              <div className="flex justify-between">
                                <span>Add-ons</span>
                                <span>+{formatCurrency(addonsSum, cur)}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-border pt-1 mt-1 text-foreground font-medium">
                              <span>Subtotal</span>
                              <span>{formatCurrency(subtotal, cur)}</span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex justify-between border-t border-border pt-2 text-foreground font-bold">
                        <span>Grand total</span>
                        <span>{formatCurrency(totalPrice ?? 0, cartCurrency)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full flex-col gap-1">
                      <h3 className="text-lg font-semibold capitalize text-Blueish">{formatCurrency(totalPrice ?? 0, cartCurrency)}</h3>
                      <button
                        type="button"
                        onClick={() => setBreakdownOpen((open) => !open)}
                        className="flex w-fit cursor-pointer items-center gap-1 text-sm capitalize text-copy underline hover:text-weelp-steel"
                        aria-expanded={breakdownOpen}
                      >
                        Detailed Breakdown
                        <ChevronDown size={14} className={`transition-transform ${breakdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        (router.push('/checkout'), setMiniCartOpen(false));
                      }}
                      className="min-h-12 w-full rounded-md bg-weelp-sage-deep px-4 py-3 text-base font-medium capitalize text-white sm:min-h-11"
                    >
                      Make Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-full flex-col gap-2 overflow-y-auto px-4 py-6 tfc_scroll group sm:px-8 sm:py-8">
              <SheetClose asChild>
                <X className="absolute right-3 top-3 z-10 size-9 cursor-pointer rounded-full bg-muted-foreground p-2 text-background duration-200 ease-in-out sm:left-1/2 sm:right-auto sm:top-2 sm:size-10 sm:-translate-y-12 sm:group-hover:translate-y-0" />
              </SheetClose>

              <div className="h-full flex items-center justify-center">
                <span
                  className={`${buttonVariants()} bg-weelp-sage-deep py-6`}
                  onClick={() => {
                    setMiniCartOpen(!isMiniCartOpen);
                  }}
                >
                  Your cart is empty
                </span>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MiniCartNew;
