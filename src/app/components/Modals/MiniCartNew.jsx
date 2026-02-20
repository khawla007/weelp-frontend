'use client';

import React from 'react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PlusIcon, Heart, X } from 'lucide-react';
import BreakSection from '../BreakSection';
import MiniCartProductCard from '../MiniCartProductCard';
import { MinicartReviewcontent } from '../MiniCartReviewCard';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { buttonVariants } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const MiniCartNew = () => {
  const router = useRouter(); // intialize route
  const { cartItems, totalPrice, isMiniCartOpen, setMiniCartOpen } = useMiniCartStore();
  return (
    <Sheet open={isMiniCartOpen} onOpenChange={setMiniCartOpen}>
      <SheetContent className="!max-w-[485px] w-full h-full p-6 bg-[#F3F5F6] rounded-t-xl shadow-xl">
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
                    return <MiniCartProductCard key={index} itemId={val?.id} itemType={val?.type} productName={val?.name} howMany={val?.howMany} dateRange={val?.dateRange} />;
                  })}
                </div>
                <MinicartReviewcontent />

                {/* Payments */}
                <div className="flex flex-col">
                  <h3 className="text-2xl font-bold capitalize text-black">your gangs</h3>
                  <div className="flex justify-between my-2">
                    <label htmlFor="splitPayments" className="flex items-center font-medium gap-4 cursor-pointer">
                      <input type="checkbox" name="splitPayments" id="splitPayments" className="accent-secondaryDark size-5" />
                      Split Your Payments
                    </label>
                    <PlusIcon className="bg-[#f4f5f7] size-10 text-grayDark rounded-full p-2 border cursor-pointer" />
                  </div>
                  <BreakSection marginTop={'my-4'} />
                  <div className="flex justify-between">
                    <div className="flex flex-col gap-1 w-full">
                      <h3 className="capitalize text-lg font-semibold text-Blueish">$ {totalPrice ?? 0}</h3>
                      <span className="capitalize underline text-[#5a5a5a]">Detailed Breakdown</span>
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
