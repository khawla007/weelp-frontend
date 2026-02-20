'use client';
import React, { useState } from 'react';
import { Edit, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';

const ReviewForm = dynamic(() => import('@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/forms/CustomerReviewForm'), { ssr: false }); // lazy load form

const BookingCard = ({ bookingItem = {} }) => {
  const [open, setOpen] = useState(false); // For Control Dialog
  const { id, travel_date, item: { name, city } = {}, review } = bookingItem;
  const rating = review?.rating ?? 0;

  return (
    <Card className="bg-white rounded-lg p-4 flex flex-col gap-4  shadow-md max-w-lg w-full dark:bg-black">
      <CardHeader className="grid grid-cols-2 py-2 flex-wrap">
        <CardTitle className={'text-[#143042] text-xl font-semibold'}>{name}</CardTitle>
        <span className="text-[#143042] text-base font-normal text-end ">{travel_date}</span>
        <span className="text-grayDark text-base font-normal">{city}</span>

        <span className="text-gray-400  text-base text-end font-medium">Booking Id :{id}</span>
      </CardHeader>
      <CardContent className="border py-2 space-y-2 border-y-graycolor border-x-0">
        <div className="flex justify-between">
          {/* Reviews */}
          {!rating == 0 && (
            <>
              <CardTitle className="text-black text-base font-semibold">Your Review</CardTitle>
              <ul className="flex">
                {Array.from({ length: rating }, (star, index) => (
                  <li key={index}>
                    <Star className="fill-yellow-300 text-yellow-300" />
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Controlled Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setOpen(true)}>
                <Edit size={16} />
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="sr-only">Create/Edit Review</DialogTitle>
                <DialogDescription className="sr-only">Update your review and click save when you &apos; re done.</DialogDescription>

                {/* Review Form */}
                <ReviewForm reviewData={bookingItem} onClose={setOpen} />
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      <Card className="flex justify-between items-center shadow-none border-none px-4 dark:bg-black">
        <Image
          src="/assets/Review.png"
          alt="Review"
          width={400} // intrinsic width of the image
          height={400} // intrinsic height of the image
          className="w-12 h-auto"
        />
        <Button className="bg-secondaryDark text-base font-normal hover:bg-secondaryDark dark:hover:bg-secondaryDark dark:hover:text-white">View Booking</Button>
      </Card>
    </Card>
  );
};

export default BookingCard;
