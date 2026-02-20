'use client';

import Accordion from '@/app/components/Faq';
import React from 'react';
import { faqItems } from '@/app/Data/ShopData';
import { Check, LifeBuoy, Map, MapPin, Pin, User, Wind, X } from 'lucide-react';
import { SingleProductReview } from './SingleProductReview';

// OverView Panel
export const OverViewPanel = ({ description }) => {
  return (
    <div className="flex flex-col gap-4 ">
      <h3 className="text-lg sm:text-[28px] font-medium text-Nileblue capitalize mb-2">Overview</h3>
      {description && <p className="text-base text-[#000000]">{description}</p>}

      <BreakSection />
    </div>
  );
};

// What's Included
export const WhatIncludedPanel = ({ triggered, panelTitle, panelContent }) => {
  const checklist = [
    {
      text: 'Pick-up and drop off at your selected hotel/location by air-conditioned vehicle',
      included: true,
    },
    {
      text: '60-Minutes Quad Bike Ride at Red dunes open desert with Fuel & Helmet',
      included: true,
    },
    {
      text: 'Accompanying Experienced instructor',
      included: true,
    },
    {
      text: 'Dune bashing with a 4x4 car',
      included: false,
    },
    {
      text: 'Tipping',
      included: false,
    },
    {
      text: 'Any other expenses not mentioned',
      included: false,
    },
  ];

  return (
    <div className="py-2 flex flex-col">
      <h3 className="text-lg sm:text-[28px] font-medium text-Nileblue capitalize mb-2">{panelTitle ? panelTitle : "What's Included"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Included Column */}
        <ul className="flex flex-col gap-4">
          {checklist
            .filter((item) => item.included)
            .map((item, index) => (
              <li key={index} className="flex items-start gap-4 text-base">
                <Check className="size-[20px]" size={24} /> {item.text}
              </li>
            ))}
        </ul>

        {/* Excluded Column */}
        <ul className="flex flex-col gap-4">
          {checklist
            .filter((item) => !item.included)
            .map((item, index) => (
              <li key={index} className="flex items-start gap-4 text-base">
                <X className="size-[20px]" size={24} /> {item.text}
              </li>
            ))}
        </ul>
      </div>
      <BreakSection />
    </div>
  );
};

//  const ReviewPane
export const ReviewPanel = ({ triggered, panelTitle, panelContent }) => {
  return (
    <div>
      <SingleProductReview />
      <BreakSection />
    </div>
  );
};

/**
 * FAQ Panel
 * <Accordion /> Component is used when faqs prop is not provided
 * @param {Array} faqs - Array of faq objects
 * @returns {JSX.Element} - Returns a div containing either <AccordionItems /> or Accordion component based on the length of faqs array
 */

export const FaqPanel = ({ faqs = [] }) => {
  return <div>{faqs.length > 0 ? <AccordionItems faqs={faqs} /> : <Accordion items={faqItems} />}</div>;
};

// ineraryPanel
export const ItineraryPanel = ({ schedules }) => {
  const pathname = usePathname();
  return (
    <div className="flex gap-16 flex-wrap lg:flex-nowrap">
      <h3 className="text-lg sm:text-[28px] font-medium text-Nileblue capitalize mb-2">
        {pathname.includes('package') ? 'Package' : 'Itinerary'} {/**Dynamic Panel Name */}
      </h3>
      <div className="text-base text-[#000000] w-full">
        <ul>
          {schedules.map((schedule, index) => {
            const { day = '', activities = [], transfers = [] } = schedule;
            return (
              <li key={index} className="space-y-3">
                <IterinaryPanelCard day={day} activities={activities} transfers={transfers} />
              </li>
            );
          })}
        </ul>
      </div>
      <BreakSection />
    </div>
  );
};

// Single Product Form
import BreakSection from '@/app/components/BreakSection';
import SingleProductForm from '@/app/components/Form/SingleProductForm';
import { log } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import SingleProductFormItinerary from '@/app/components/Form/SingleProductFormItinerary';
import SingleProductFormPackage from '@/app/components/Form/SingleProductFormPackage';
import { usePathname } from 'next/navigation';
import { AccordionItems } from '@/app/components/Accordion';

// activity form
export const ProductForm = ({ productId, productData }) => {
  const gradientStyle = {
    background: 'linear-gradient(180deg, rgba(255,255,255,1) 5%, rgba(236,255,232,1) 100%)',
  };
  return (
    <div className="p-6 sm:p-12 sm:pe-32 bg-no-repeat bg-bottom bg-cover sm:sticky sm:top-12 sm:right-0">
      <h3 className="text-Blueish font-bold text-xl sm:text-2xl capitalize">From $ {productData?.pricing?.regular_price ?? '6,790.18'}</h3>
      <BreakSection marginTop={'mt-9'} />
      <SingleProductForm productData={productData} />

      <div className="flex gap-4 flex-wrap items-start sm:items-center sm:justify-between border p-6 rounded-xl" style={gradientStyle}>
        <div className="flex flex-col gap-2">
          <h2 className="text-Blueish font-semibold capitalize text-lg">Questions?</h2>
          <p className="text-base text-black text-wrap w-4/5">Visit the Weelp Help Centre for any further questions.</p>

          <span className="sm:text-base mt-2 sm:mt-4">Product ID : {productId ?? 451245}</span>
        </div>
        <button className="p-4 font-medium text-xs sm:text-base capitalize border rounded-md h-fit w-fit text-black border-black">Help Center</button>
      </div>
    </div>
  );
};

// itinerary form
export const ProductFormItinerary = ({ productData }) => {
  const gradientStyle = {
    background: 'linear-gradient(180deg, rgba(255,255,255,1) 5%, rgba(236,255,232,1) 100%)',
  };
  return (
    <div className="p-6 sm:p-12 sm:pe-32 bg-no-repeat bg-bottom bg-cover sm:sticky sm:top-12 sm:right-0">
      <h3 className="text-Blueish font-bold text-xl sm:text-2xl capitalize">From $ {productData?.base_pricing?.variations[0]?.regular_price}</h3>
      <BreakSection marginTop={'mt-9'} />
      <SingleProductFormItinerary productData={productData} />

      <div className="flex gap-4 flex-wrap items-start sm:items-center sm:justify-between border p-6 rounded-xl" style={gradientStyle}>
        <div className="flex flex-col gap-2">
          <h2 className="text-Blueish font-semibold capitalize text-lg">Questions?</h2>
          <p className="text-base text-black text-wrap w-4/5">Visit the Weelp Help Centre for any further questions.</p>
          {productData?.id && <span className="sm:text-base mt-2 sm:mt-4">Product ID : {productData?.id}</span>}
        </div>
        <button className="p-4 font-medium text-xs sm:text-base capitalize border rounded-md h-fit w-fit text-black border-black">Help Center</button>
      </div>
    </div>
  );
};

// package form
export const ProductFormPackage = ({ productData }) => {
  const gradientStyle = {
    background: 'linear-gradient(180deg, rgba(255,255,255,1) 5%, rgba(236,255,232,1) 100%)',
  };
  return (
    <div className="p-6 sm:p-12 sm:pe-32 bg-no-repeat bg-bottom bg-cover sm:sticky sm:top-12 sm:right-0">
      <h3 className="text-Blueish font-bold text-xl sm:text-2xl capitalize">From $ {productData?.base_pricing?.variations[0]?.regular_price}</h3>
      <BreakSection marginTop={'mt-9'} />
      <SingleProductFormPackage productData={productData} />

      <div className="flex gap-4 flex-wrap items-start sm:items-center sm:justify-between border p-6 rounded-xl" style={gradientStyle}>
        <div className="flex flex-col gap-2">
          <h2 className="text-Blueish font-semibold capitalize text-lg">Questions?</h2>
          <p className="text-base text-black text-wrap w-4/5">Visit the Weelp Help Centre for any further questions.</p>
          {productData?.id && <span className="sm:text-base mt-2 sm:mt-4">Product ID : {productData?.id}</span>}
        </div>
        <button className="p-4 font-medium text-xs sm:text-base capitalize border rounded-md h-fit w-fit text-black border-black">Help Center</button>
      </div>
    </div>
  );
};

// Shared Components of Tabs
const IterinaryPanelCard = ({ day, activities, transfers }) => {
  const { name, pickup_location, dropoff_location } = transfers?.[0] || {};
  const activity = activities?.[0] || {}; // Extract first activity
  const { name: activityname } = activity;

  return (
    <div className="space-y-3">
      {/* transfer */}
      <p className="text-black text-lg font-semibold">Day -{day} Arrival In Port Blair</p>
      <div className="bg-white  rounded-md py-4">
        <div className="flex">
          <img src="https://picsum.photos/300/200?random=1" alt="pic" className="size-40" />
          <div className=" flex flex-col justify-start p-4">
            <h3 className="text-black text-lg font-semibold">{name}</h3>
            <p>Swift, Verna</p>
            <div className="flex py-8 gap-2 flex-wrap">
              <span className="text-[#5A5A5A] inline-flex gap-2 items-center justify-center font-medium  text-sm">
                <User /> 3 Seater
              </span>
              <span className="text-[#5A5A5A] inline-flex gap-2 items-center justify-center font-medium  text-sm">
                <Wind /> AC
              </span>
              <span className="text-[#5A5A5A] inline-flex gap-2 items-center justify-center font-medium  text-sm">
                <LifeBuoy /> First Aid
              </span>
            </div>

            {/* From To */}
          </div>
        </div>
        <div className="px-4 flex justify-between ">
          <span className="inline-flex  gap-2 border rounded-md p-2 px-4">
            <MapPin /> Airport
          </span>
          <Separator className={'w-fit'} />
          <span className="inline-flex  gap-2 border rounded-md p-2 px-4">
            <MapPin /> Hotel
          </span>
        </div>
      </div>

      {/* activity */}
      <div className="bg-white  rounded-md py-4">
        <div className="flex">
          <img src="https://picsum.photos/300/200?random=2" alt="pic" className="size-40" />
          <div className=" flex flex-col justify-start p-4">
            <h3 className="text-black text-lg font-semibold">{activityname}</h3>
            <p>Swift, Verna</p>
            <div className="flex py-8 gap-2 flex-wrap">
              <span className="text-[#5A5A5A] inline-flex gap-2 items-center justify-center font-medium  text-sm">
                <User /> 3 Seater
              </span>
              <span className="text-[#5A5A5A] inline-flex gap-2 items-center justify-center font-medium  text-sm">
                <Wind /> AC
              </span>
              <span className="text-[#5A5A5A] inline-flex gap-2 items-center justify-center font-medium  text-sm">
                <LifeBuoy /> First Aid
              </span>
            </div>

            {/* From To */}
          </div>
        </div>

        {/* picup location */}
        {pickup_location && dropoff_location && (
          <div className="px-4 flex justify-between ">
            <span className="inline-flex  gap-2 border rounded-md p-2 px-4">
              <MapPin /> {pickup_location}
            </span>
            <Separator className={'w-fit'} />
            <span className="inline-flex  gap-2 border rounded-md p-2 px-4">
              <MapPin /> {dropoff_location}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
