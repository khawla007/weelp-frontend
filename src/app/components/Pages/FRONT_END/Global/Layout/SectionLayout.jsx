import React from 'react';

const SectionLayout = ({ title, children, className = '' }) => {
  return (
    <section className={`container mx-auto flex flex-col gap-3 p-4 sm:py-8 productSlider ${className}`}>
      {title && <h2 className="text-[28px] font-medium text-Nileblue">{title}</h2>}
      {children}
    </section>
  );
};

export default SectionLayout;
