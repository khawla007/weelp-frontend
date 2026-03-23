'use client';
import React, { Suspense } from 'react';
import BannerSection from '@/app/components/Pages/FRONT_END/shop/BannerSection';
import { redirect, useSearchParams } from 'next/navigation';
import { SearchPage } from '@/app/components/Pages/FRONT_END/shop/SearchPage';

const SearchContent = () => {
  const searchParams = useSearchParams();
  const location = searchParams.get('location'); // Get actual value
  const startDate = searchParams.get('start_date');

  const hasSearchParams = location && startDate;
  !hasSearchParams && redirect('/shop');
  return (
    <>
      <BannerSection />
      <SearchPage />
    </>
  );
};

const Search = () => (
  <Suspense fallback={<div className="my-4 h-screen flex items-center justify-center"><span className="loader"></span></div>}>
    <SearchContent />
  </Suspense>
);

export default Search;
