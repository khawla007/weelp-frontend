'use client';
import React from 'react';
import BannerSection from '@/app/components/Pages/FRONT_END/shop/BannerSection';
import { redirect, useSearchParams } from 'next/navigation';
import { SearchPage } from '@/app/components/Pages/FRONT_END/shop/SearchPage';

const Search = () => {
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

export default Search;
