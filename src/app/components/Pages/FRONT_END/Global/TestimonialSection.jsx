import React from 'react';
import { TestmonialSlider } from '../../../sliders/TestimonialSlider';

const TestimonialSection = ({ reviews = [] }) => {
  return (
    <section className="container mx-auto flex flex-col gap-8 px-4 pb-[70px] relative">
      <h2 className="text-[28px] font-medium text-Nileblue text-center">
        Do you think you
        <br /> make good plans?{' '}
      </h2>
      <TestmonialSlider reviews={reviews} />
    </section>
  );
};

export default TestimonialSection;
