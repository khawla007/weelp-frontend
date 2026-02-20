import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export const LoadingPage = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white bg-opacity-50">
      <span className="loader"></span>
    </div>
  );
};

export const ProductCardSkelton = ({ className }) => {
  return (
    <div role="status" className={`${className ?? ''} sm:max-w-xs w-full p-4 border border-gray-200 rounded shadow animate-pulse dark:border-gray-700`}>
      <div className="flex items-center justify-center h-48 mb-4 bg-gray-300 rounded dark:bg-gray-700"></div>
      <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
      <div className="flex items-center mt-4 gap-2">
        <button className="bg-gray-200 rounded-sm dark:bg-gray-700 w-48 py-4  h-4"></button>
        <div>
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
          <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
};

export const DestinationCardSkelton = ({ imgHeight, imgWidth, className }) => {
  return (
    <div className={`${className} relative w-full sm:w-fit mx-auto animate-pulse`}>
      {/* Skeleton for Image */}
      <div className={`bg-gray-300 object-cover w-full ${imgHeight ?? 'h-[360px]'} ${imgWidth ?? 'sm:w-[220px] lg:w-60'} rounded-lg`}></div>

      {/* Skeleton for Text Overlay */}
      <div className="absolute bottom-0 w-full p-6 rounded-b-lg bg-gray-200">
        {/* Skeleton for Title */}
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        {/* Skeleton for Subtitle */}
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export const TestimonialCardSkelton = ({ className }) => {
  return (
    <div className={`${className ?? 'flex'}  flex-col gap-4 max-w-sm w-full  rounded-lg p-4 py-6  border-gray-500 shadow-md h-full animate-pulse`}>
      <div className="flex gap-4 items-center flex-wrap">
        <div className={`rounded-full w-16 h-16 bg-gray-300 border-gray-500 animate-pulse`} />

        <div>
          <h3 className={`text-black text-xl font-semibold flex items-center gap-2 animate-pulse`}>
            <span className={`w-24 bg-gray-300 h-4 animate-pulse`} /> {/* Placeholder for name */}
            <span className={`w-6 h-6 rounded-full  animate-pulse`} /> {/* Placeholder for badge */}
          </h3>

          <span className={`font-normal text-gray-500 w-32 h-4 bg-gray-300 animate-pulse`} />
        </div>

        <button className={`border border-gray-300 p-2 px-6 rounded-3xl shadow-md w-fit text-gray-500 font-normal animate-pulse`}>
          <span className={`w-20 bg-gray-300 h-4 animate-pulse`} />
        </button>
      </div>

      <div>
        <h3 className={`text-black text-xl mb-3 w-full bg-gray-300 h-6 animate-pulse`} />
      </div>

      <div className={`flex justify-between flex-wrap`}>
        <span className={`text-gray-400 font-normal text-base uppercase w-32 bg-gray-300 h-4 animate-pulse`} />
      </div>
    </div>
  );
};

export const ReviewCardSkelton = ({ className }) => {
  return (
    <div className={`${className ?? ''}  max-w-full sm:max-w-xs w-full `}>
      <div className="w-full p-4 bg-white shadow-lg rounded-lg animate-pulse transform transition duration-1000">
        <div className="flex items-center mb-16">
          <div className="h-5 w-24 bg-gray-300 rounded-md"></div>
          <div className="ml-auto flex space-x-2">
            <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
            <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
            <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
          </div>
        </div>
        <div className="bg-gray-300 h-4 w-full rounded-md mb-2"></div>
        <div className="bg-gray-300 h-4 w-3/4 rounded-md mb-2"></div>
        <div className="bg-gray-300 h-4 w-2/4 rounded-md mb-2"></div>
      </div>
    </div>
  );
};

export const ImageSkeltonCard = ({ className }) => {
  return <div className={`${className} skeleton-image max-w-xs animate-pulse bg-gray-300 w-full h-72 rounded-md mb-4`} />;
};

export const DashboardCardSkelton = ({}) => {
  return (
    <Card className="w-full lg:w-fit border rounded-lg">
      <div className="w-full lg:w-[326px] h-[183px] bg-gray-300 animate-pulse rounded-lg" />
      <div className="p-4 space-y-2">
        <div className="flex gap-4">
          <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
          <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
          <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="flex gap-2 flex-col">
          <div className="w-1/2 h-5 bg-gray-300 rounded-full"></div>
          <div className="w-1/2 h-5 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </Card>
  );
};
