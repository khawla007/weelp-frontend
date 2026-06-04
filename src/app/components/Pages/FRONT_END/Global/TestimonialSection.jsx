import { TestmonialSlider } from '../../../sliders/TestimonialSlider';
import Reveal from '@/app/components/ui/Reveal';

const TestimonialSection = ({ reviews = [] }) => {
  return (
    <Reveal as="section" initialHidden className="container-page relative flex flex-col gap-8 pb-10 md:pb-16 lg:pb-24">
      <Reveal as="h2" variant="lift" className="text-[28px] font-medium text-[#18181b] text-center">
        Postcards from travelers.
      </Reveal>
      <TestmonialSlider reviews={reviews} />
    </Reveal>
  );
};

export default TestimonialSection;
