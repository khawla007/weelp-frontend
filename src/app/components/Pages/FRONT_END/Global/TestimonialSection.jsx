import { TestmonialSlider } from '../../../sliders/TestimonialSlider';

const TestimonialSection = ({ reviews = [] }) => {
  return (
    <section className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:px-8 pb-16 md:pb-20 lg:pb-24">
      <h2 className="text-[28px] font-medium text-Nileblue text-center">Postcards from travelers.</h2>
      <TestmonialSlider reviews={reviews} />
    </section>
  );
};

export default TestimonialSection;
