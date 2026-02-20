import React from 'react';
import PostSlider from '../../../sliders/PostSlider';

const GuideSection = ({ sectionTitle, data }) => {
  if (sectionTitle && data) {
    return (
      <section className="container mx-auto flex flex-col gap-3 p-4 sm:py-8 my-10 productSlider">
        <h2 className="text-[28px] font-medium text-Nileblue top-4">{sectionTitle || 'Your Guide'}</h2>
        <PostSlider data={data} />
      </section>
    );
  }
  return;
};

export default GuideSection;
