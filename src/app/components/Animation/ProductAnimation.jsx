import React from 'react';
import { ProductCardSkelton, DestinationCardSkelton, TestimonialCardSkelton, ReviewCardSkelton, ImageSkeltonCard, DashboardSkeltonCard, DashboardCardSkelton } from './Cards';

export const ProductCarouselAnimation = () => {
  return (
    <div className="flex justify-evenly py-12">
      <ProductCardSkelton />
      <ProductCardSkelton className="hidden sm:block" />
      <ProductCardSkelton className="hidden" />
      <ProductCardSkelton className="hidden lg:block" />
      <ProductCardSkelton className="hidden xl:block" />
    </div>
  );
};

export const DestinationCarouselAnimation = () => {
  return (
    <div className="flex justify-evenly py-12">
      <DestinationCardSkelton />
      <DestinationCardSkelton className="hidden sm:block" />
      <DestinationCardSkelton className="hidden sm:block" />
      <DestinationCardSkelton className="hidden lg:block" />
      <DestinationCardSkelton className="hidden 2xl:block" />
    </div>
  );
};

export const TestimonialCarouselAnimation = () => {
  return (
    <div className="flex justify-evenly">
      <TestimonialCardSkelton />
      <TestimonialCardSkelton className="hidden" />
      <TestimonialCardSkelton className="hidden sm:flex" />
      <TestimonialCardSkelton className="hidden lg:flex" />
      <TestimonialCardSkelton className="hidden xl:flex" />
    </div>
  );
};

export const ReviewCardCarouselAnimation = () => {
  return (
    <div className="flex justify-evenly md:justify-normal gap-4 py-16">
      <ReviewCardSkelton />
      <ReviewCardSkelton className="hidden sm:block" />
      <ReviewCardSkelton className="hidden md:block" />
    </div>
  );
};

export const ProductGalleryAnimation = () => {
  return (
    <div className="w-full p-4 bg-gray-100 rounded-md shadow-md flex justify-evenly md:justify-normal gap-4">
      <ImageSkeltonCard />
      <ImageSkeltonCard className="hidden sm:block" />
      <ImageSkeltonCard className="hidden md:block" />
    </div>
  );
};

export const DashboardCardAnimation = () => {
  return (
    <div className="w-full p-4 bg-gray-100 rounded-md shadow-md grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <DashboardCardSkelton />
      <DashboardCardSkelton className="hidden sm:block" />
      <DashboardCardSkelton className="hidden md:block" />
    </div>
  );
};
