'use client';
import React from 'react';
import { SearchFormBlogs, SearchFormCreator } from '@/app/components/Form/SearchForm';
import { usePathname } from 'next/navigation';

/** This section handle Creator / Blogs  */
const BannerSectionSearchForm = ({ title, description }) => {
  const pathName = usePathname();
  if (title && description) {
    return (
      <section className="relative min-h-[320px] sm:min-h-[420px] h-full flex justify-center items-center bg-[#F5F9FA] p-6">
        <div className="max-w-xl w-full flex flex-col justify-center items-center gap-2">
          <h1 className="text-xl sm:text-5xl font-semibold text-[#143042] text-center">{title}</h1>
          <p className="text-sm sm:text-lg font-medium text-grayDark text-center">{description}</p>
          <div className={`mt-6 w-full`}>{pathName == '/blogs' ? <SearchFormBlogs /> : <SearchFormCreator />}</div>
          <img alt="logo" className="hidden 2xl:block absolute -top-8 right-0 scale-90" src="/assets/Group5.png" />
        </div>
      </section>
    );
  }
  return;
};

export default BannerSectionSearchForm;
