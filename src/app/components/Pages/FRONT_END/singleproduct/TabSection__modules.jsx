'use client';

import React, { useState } from 'react';
import { Check, X, ChevronRight, MapPin, LifeBuoy, User, Wind } from 'lucide-react';
import { SingleProductReview } from './SingleProductReview';
import { activityHighlights, inclusionsList, activityFaqs } from '@/app/Data/SingleActivityData';
import BreakSection from '@/app/components/BreakSection';
import SingleProductForm from '@/app/components/Form/SingleProductForm';
import SingleProductFormItinerary from '@/app/components/Form/SingleProductFormItinerary';
import SingleProductFormPackage from '@/app/components/Form/SingleProductFormPackage';
import { usePathname } from 'next/navigation';
import { AccordionItems } from '@/app/components/Accordion';
import { Separator } from '@/components/ui/separator';

// OverView Panel
export const OverViewPanel = ({ description }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize">Overview</h2>
      {description && <p className="text-base text-black leading-[1.5]">{description}</p>}
      <ul className="flex flex-col gap-3 mt-2">
        {activityHighlights.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-base text-black leading-[1.5]">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

// What's Included
export const WhatIncludedPanel = () => {
  const included = inclusionsList.filter((item) => item.included);
  const excluded = inclusionsList.filter((item) => !item.included);

  return (
    <div className="flex flex-col border-t border-[#d9d9d9]">
      <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize pt-6">What&apos;s Included</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-4">
        <ul className="flex flex-col gap-4">
          {included.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-base text-black">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" size={20} />
              {item.text}
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-4">
          {excluded.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-base text-black">
              <X className="w-5 h-5 flex-shrink-0 mt-0.5" size={20} />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
      <button className="text-left text-base text-black mt-4 hover:underline">See 14 More</button>
    </div>
  );
};

// Review Panel
export const ReviewPanel = ({ productData, activitySlug }) => {
  return (
    <div>
      <SingleProductReview productData={productData} activitySlug={activitySlug} />
    </div>
  );
};

// FAQ Panel
export const FaqPanel = ({ faqs = [] }) => {
  const faqData = faqs.length > 0 ? faqs : activityFaqs;

  return (
    <div className="flex flex-col border-t border-[#d9d9d9]">
      <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize pt-6 mb-4">FAQs</h2>

      {/* Inclusion checklist repeated per design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <ul className="flex flex-col gap-4">
          {inclusionsList
            .filter((i) => i.included)
            .map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-base text-black">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" size={20} />
                {item.text}
              </li>
            ))}
        </ul>
        <ul className="flex flex-col gap-4">
          {inclusionsList
            .filter((i) => !i.included)
            .map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-base text-black">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5" size={20} />
                {item.text}
              </li>
            ))}
        </ul>
      </div>

      {/* Accordion FAQ items */}
      <div className="flex flex-col gap-3">
        {faqData.map((faq, index) => (
          <FaqAccordionItem key={index} question={faq.title} answer={faq.content} defaultOpen={index === 0} />
        ))}
      </div>
    </div>
  );
};

const FaqAccordionItem = ({ question, answer, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#e5e5e5] rounded-xl overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="text-base font-semibold text-[#0c2536]">{question}</span>
        <ChevronRight className={`transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} size={16} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-5 pb-5 text-sm text-black/80 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

// Activity Product Form (booking sidebar)
export const ProductForm = ({ productId, productData }) => {
  return (
    <div className="p-6 lg:px-[60px] lg:pt-[60px] lg:pb-[70px] lg:sticky lg:top-[76px]">
      {/* Price */}
      <h3 className="text-[#0c2536] font-bold text-2xl lg:text-[28px]">From ${productData?.pricing?.regular_price ?? '6,790.18'}</h3>

      {/* Actual Form with Inputs */}
      <SingleProductForm productId={productId} productData={productData} />

      {/* Questions Card */}
      <div className="mt-8 border border-[#e5e5e5] rounded-xl p-7 bg-white/70 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-[#0c2536] font-semibold text-lg">Questions?</h4>
            <p className="text-base text-black">Visit the Weelp Help Centre for any further questions.</p>
            <span className="text-base mt-2">Product ID : {productId ?? 451245}</span>
          </div>
          <button className="px-6 py-3 border border-black rounded-lg text-sm font-medium text-black whitespace-nowrap hover:bg-gray-50 transition-colors">Help Center</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PRESERVED EXPORTS — used by itinerary/package pages
// ==========================================

// Itinerary Panel
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

// Itinerary form
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

// Package form
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
