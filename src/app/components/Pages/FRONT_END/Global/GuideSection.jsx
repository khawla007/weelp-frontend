import React from 'react';
import PostSlider from '../../../sliders/PostSlider';

const GuideSection = ({ sectionTitle, data, className = 'py-12' }) => {
  if (sectionTitle && data) {
    return (
      <section className={`container mx-auto flex flex-col gap-3 px-4 productSlider blog_slider_section ${className}`}>
        <h2 className="text-xl sm:text-2xl md:text-[28px] font-medium text-Nileblue">{sectionTitle || 'Your Guide'}</h2>
        <PostSlider data={data} />
      </section>
    );
  }
  return;
};

export default GuideSection;
