import React from 'react';
import BookingForm from '@/app/components/Form/Form';
import BreakSection from '@/app/components/BreakSection';
import { FaqPanel, ReviewPanel } from '@/app/components/Pages/FRONT_END/singleproduct/TabSection__modules';
import Accordion from '@/app/components/Faq';
import { faqItems } from '@/app/Data/ShopData';
import ReviewSection from '@/app/components/Pages/FRONT_END/Global/ReviewSection';
import ReviewSlider from '@/app/components/sliders/ReviewSlider';
import { TransfertCard } from '@/app/components/TransfertCard';
import Image from 'next/image';

const BookYourTaxi = () => {
  return (
    <>
      <section className="relative min-h-[320px] sm:min-h-[420px] h-full flex justify-center items-center bg-[#F5F9FA] p-6">
        <div className="max-w-xl w-full flex flex-col justify-center items-center gap-2">
          <h1 className="text-xl sm:text-5xl font-semibold text-[#143042] text-center">Book Your Taxi</h1>
          <p className="text-sm sm:text-lg font-medium text-grayDark text-center">
            You&apos;ll discover everything from whisky to Harry Potter, or even some bodysnatchers, in Scotland&apos;s captivating capital.{' '}
          </p>
          <div className={`mt-6 w-full`}>
            <BookingForm />
          </div>
          <Image className="hidden 2xl:block absolute -top-8 right-0 scale-90" src="/assets/Group5.png" width={500} height={500} alt="banner_image" />
        </div>
      </section>
    </>
  );
};

export default BookYourTaxi;
