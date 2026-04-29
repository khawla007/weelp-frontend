'use client';

import React, { useState } from 'react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChevronDown, Heart, X } from 'lucide-react';
import BreakSection from '../BreakSection';
import MiniCartProductCard from '../MiniCartProductCard';
import { MinicartReviewcontent } from '../MiniCartReviewCard';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { buttonVariants } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

const MiniCartNew = () => {
  const router = useRouter(); // intialize route
  const { cartItems, totalPrice, isMiniCartOpen, setMiniCartOpen } = useMiniCartStore();
  const cartCurrency = cartItems?.[0]?.currency || 'USD';
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  return (
    <Sheet open={isMiniCartOpen} onOpenChange={setMiniCartOpen}>
      <SheetContent className="!max-w-[485px] w-full h-full p-6 bg-[#F3F5F6] shadow-xl">
        <SheetHeader>
          <SheetTitle className="sr-only">MiniCart</SheetTitle>
          <SheetDescription className="sr-only"></SheetDescription>
        </SheetHeader>

        <div className="w-full h-full bg-inherit">
          {cartItems && cartItems.length > 0 ? (
            // if data exist
            <div className="px-4 flex flex-col gap-2 h-full min-h-full tfc_scroll overflow-y-scroll group">
              <X
                onClick={() => setMiniCartOpen(!isMiniCartOpen)}
                className="self-end cursor-pointer size-10 p-2 absolute top-2 z-10 left-1/2 bg-[#5a5a5a] text-white ease-in-out duration-200  -translate-y-12   group-hover:translate-y-0   rounded-full"
              />
              <div className="flex justify-between mt-4">
                <h3 className="text-Blueish font-bold text-2xl">Your Cart</h3>
                <div className="flex gap-2 text-base items-center text-[#5A5A5A]">
                  <Heart size={20} />
                  Save
                </div>
              </div>

              <BreakSection marginTop={'my-4'} />

              <div className="flex justify-between flex-col h-full">
                {/* From  ->  To */}
                <div className="rounded-xl shadow-sm flex flex-col gap-4">
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
                <div className="flex flex-col">
                  <BreakSection marginTop={'my-4'} />

                  {breakdownOpen && (
                    <div className="bg-white border border-[#eee] rounded-lg p-4 mb-3 text-sm text-[#5a5a5a] space-y-4 max-h-72 overflow-y-auto">
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
                            <div className="flex justify-between border-t pt-1 mt-1 text-[#0c2536] font-medium">
                              <span>Subtotal</span>
                              <span>{formatCurrency(subtotal, cur)}</span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex justify-between border-t pt-2 text-[#0c2536] font-bold">
                        <span>Grand total</span>
                        <span>{formatCurrency(totalPrice ?? 0, cartCurrency)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <div className="flex flex-col gap-1 w-full">
                      <h3 className="capitalize text-lg font-semibold text-Blueish">{formatCurrency(totalPrice ?? 0, cartCurrency)}</h3>
                      <button
                        type="button"
                        onClick={() => setBreakdownOpen((open) => !open)}
                        className="flex items-center gap-1 capitalize text-[#5a5a5a] text-sm hover:text-Blueish cursor-pointer underline w-fit"
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
                      className="w-full capitalize rounded-md bg-secondaryDark text-[#ffffff] text-base font-medium"
                    >
                      Make Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-8 py-8 flex flex-col gap-2 h-full min-h-full tfc_scroll overflow-y-scroll group ">
              <SheetClose asChild>
                <X className="self-end cursor-pointer size-10 p-2 absolute top-2 z-10 left-1/2 bg-[#5a5a5a] text-white ease-in-out duration-200  -translate-y-12   group-hover:translate-y-0   rounded-full" />
              </SheetClose>

              <div className="h-full flex items-center justify-center">
                <span
                  className={`${buttonVariants()} bg-secondaryDark py-6`}
                  onClick={() => {
                    setMiniCartOpen(!isMiniCartOpen);
                  }}
                >
                  Sorry Not Item In Cart
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
