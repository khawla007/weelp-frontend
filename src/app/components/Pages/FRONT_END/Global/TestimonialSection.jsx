import { TestmonialSlider } from '../../../sliders/TestimonialSlider';
import Reveal from '@/app/components/ui/Reveal';

const SECTION_TITLE = 'Postcards from travelers.';

const TestimonialSection = ({ reviews = [], entrance }) => {
  const usesStaggeredEntrance = entrance === 'stagger-right';
  const HeadingRoot = usesStaggeredEntrance ? 'h2' : Reveal;
  const sectionRootProps = usesStaggeredEntrance
    ? {
        'aria-label': SECTION_TITLE,
        'data-carousel-section-entrance': entrance,
      }
    : {};
  const headingRootProps = usesStaggeredEntrance ? { 'data-carousel-section-header': '' } : { as: 'h2', variant: 'lift' };

  return (
    <Reveal as="section" initialHidden {...sectionRootProps} className="container-page relative flex flex-col gap-8 pb-12 md:pb-16 lg:pb-24">
      <HeadingRoot {...headingRootProps} className="text-center text-[28px] font-medium text-foreground">
        {SECTION_TITLE}
      </HeadingRoot>
      <TestmonialSlider reviews={reviews} entrance={usesStaggeredEntrance ? entrance : undefined} observeReveal={usesStaggeredEntrance ? false : undefined} />
    </Reveal>
  );
};

export default TestimonialSection;
