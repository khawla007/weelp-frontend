'use client';

import React, { useState } from 'react';
import { Check, X, ChevronRight } from 'lucide-react';
import { SingleProductReview } from './SingleProductReview';
import { activityHighlights, inclusionsList, activityFaqs } from '@/app/Data/SingleActivityData';

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
