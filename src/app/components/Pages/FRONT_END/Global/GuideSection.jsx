import React from 'react';
import PostSlider from '../../../sliders/PostSlider';

const GuideSection = ({ sectionTitle, data, className = 'pb-10 md:pb-16 lg:pb-24' }) => {
  if (sectionTitle && data) {
    return (
      <section className={`container-page flex flex-col gap-3 productSlider blog_slider_section ${className}`}>
        <h2 className="text-xl sm:text-2xl md:text-[28px] font-medium text-[#18181b]">{sectionTitle || 'Your Guide'}</h2>
        <PostSlider data={data} />
      </section>
    );
  }
  return;
};

export default GuideSection;
