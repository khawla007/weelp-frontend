import React from 'react';
import { TestmonialSlider } from '../../../sliders/TestimonialSlider';

const TestimonialSection = () => {
  return (
    <section className="flex flex-col gap-3 p-4 relative sm:py-8">
      <h2 className="text-[28px] font-medium text-Nileblue text-center pb-4 sm:pb-12">
        Do you think you
        <br /> make good plans?{' '}
      </h2>
      <TestmonialSlider />
    </section>
  );
};

export default TestimonialSection;
