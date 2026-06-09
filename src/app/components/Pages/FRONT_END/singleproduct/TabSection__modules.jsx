'use client';

import { useState } from 'react';
import { Check, X, ChevronRight } from 'lucide-react';
import SectionHeader from '@/app/components/ui/SectionHeader';
import { SingleProductReview } from './SingleProductReview';
import { activityHighlights, inclusionsList, activityFaqs } from '@/app/Data/SingleActivityData';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

// OverView Panel
export const OverViewPanel = ({ description }) => {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title="Overview" />
      {description && <p className="text-base text-[#18181b] leading-[1.6]">{description}</p>}
      <ul className="flex flex-col gap-3 mt-2">
        {activityHighlights.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-base text-[#18181b] leading-[1.6]">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-weelp-sage-deep flex-shrink-0" aria-hidden="true" />
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
    <div className="flex flex-col border-t border-[#eaeaea] pt-6">
      <SectionHeader title="What's Included" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-4">
        <ul className="flex flex-col gap-4">
          {included.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-base text-[#18181b]">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-weelp-sage-deep" size={20} aria-hidden="true" />
              {item.text}
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-4">
          {excluded.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-base text-[#71717a]">
              <X className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#71717a]" size={20} aria-hidden="true" />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
      <button type="button" className={`text-left text-base font-medium text-[#18181b] mt-4 hover:underline rounded-sm w-fit ${FOCUS_RING}`}>
        See 14 More
      </button>
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
    <div className="flex flex-col border-t border-[#eaeaea] pt-6">
      <SectionHeader title="FAQs" className="mb-4" />

      {/* Inclusion checklist repeated per design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <ul className="flex flex-col gap-4">
          {inclusionsList
            .filter((i) => i.included)
            .map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-base text-[#18181b]">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-weelp-sage-deep" size={20} aria-hidden="true" />
                {item.text}
              </li>
            ))}
        </ul>
        <ul className="flex flex-col gap-4">
          {inclusionsList
            .filter((i) => !i.included)
            .map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-base text-[#71717a]">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#71717a]" size={20} aria-hidden="true" />
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
    <div className="border border-[#e4e4e7] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between p-5 text-left hover:bg-[#f8faf9] transition-colors ${FOCUS_RING}`}
      >
        <span className="text-base font-semibold text-[#18181b]">{question}</span>
        <ChevronRight className={`transition-transform duration-300 flex-shrink-0 text-[#52525b] ${isOpen ? 'rotate-90' : ''}`} size={16} aria-hidden="true" />
      </button>
      <div className={`overflow-hidden transition-opacity duration-300 ease-[var(--weelp-ease-panel)] motion-reduce:transition-none ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-5 pb-5 text-sm text-[#71717a] leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};
