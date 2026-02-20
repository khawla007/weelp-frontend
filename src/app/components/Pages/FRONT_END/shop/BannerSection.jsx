'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import BookingForm from '@/app/components/Form/Form';
import styles from './BannerSection.module.css';

const BannerSection = () => {
  const searchParams = useSearchParams();
  const location = searchParams.get('location');

  return (
    <>
      <div className={`bg-secondaryDark shop_banner ${styles.shop_banner} `}>
        <BookingForm />
      </div>
      {location && (
        <div className="flex items-center justify-center  bg-[#f5f9fa] h-full min-h-20 sm:min-h-36">
          {/* <Icon className={"hidden sm:block -translate-x-20 "} /> */}
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold sm:text-3xl text-center text-Nileblue ">
              You Searched for &quot;
              <span className=" capitalize">{location}&apos;</span>&quot;
            </h1>
            {/* <p className="text-center font-medium text-Nileblue text-sm sm:text-lg">
              {location.length} Result Founds
            </p> */}
          </div>
          {/* <Icon className={"hidden sm:block "} /> */}
        </div>
      )}
    </>
  );
};

export default BannerSection;

export const Icon = ({ className }) => {
  return (
    <svg className={`${className} h-full min-h-full`} width="236" height="144" viewBox="0 0 236 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M236 0L128.46 558L0 558L110.234 0H236Z" fill="#57947D" />
    </svg>
  );
};
