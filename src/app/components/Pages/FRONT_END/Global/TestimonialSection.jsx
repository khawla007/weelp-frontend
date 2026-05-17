import { TestmonialSlider } from '../../../sliders/TestimonialSlider';

const TestimonialSection = ({ reviews = [] }) => {
  return (
    <section className="container-page relative flex flex-col gap-8 pb-10 md:pb-16 lg:pb-24">
      <h2 className="text-[28px] font-medium text-[#18181b] text-center">Postcards from travelers.</h2>
      <TestmonialSlider reviews={reviews} />
    </section>
  );
};

export default TestimonialSection;
