import React from 'react';
import PostSlider from '../../../sliders/PostSlider';
import Reveal from '@/app/components/ui/Reveal';

const GuideSection = ({ sectionTitle, data, className = 'pb-10 md:pb-16 lg:pb-24' }) => {
  if (sectionTitle && data) {
    return (
      <section className={`container-page flex flex-col gap-3 productSlider blog_slider_section ${className}`}>
        <Reveal as="h2" variant="lift" className="text-xl sm:text-2xl md:text-[28px] font-medium text-foreground">
          {sectionTitle || 'Your Guide'}
        </Reveal>
        <Reveal variant="lift" delay={120}>
          <PostSlider data={data} />
        </Reveal>
      </section>
    );
  }
  return;
};

export default GuideSection;
