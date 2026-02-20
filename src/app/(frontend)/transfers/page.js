import BreakSection from '@/app/components/BreakSection';
import Accordion from '@/app/components/Faq';
import BannerSection from '@/app/components/Pages/FRONT_END/transfer/BannerSection';
import ReviewSlider from '@/app/components/sliders/ReviewSlider';
import { TransfertCard } from '@/app/components/TransfertCard';
import { faqItems } from '@/app/Data/ShopData';
import React from 'react';

const TransferPage = () => {
  return (
    <>
      <BannerSection />
      <BreakSection />
      <section className="relative">
        <div className="max-w-screen-xl w-full mx-auto  productSlider space-y-8 p-4">
          <h2 className="text-3xl font-semibold text-Nileblue">Featured Review</h2>
          <ReviewSlider />
          <Accordion items={faqItems} />
        </div>
      </section>
    </>
  );
};

export default TransferPage;
