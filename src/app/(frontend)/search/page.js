'use client';
import React, { Suspense } from 'react';
import { PageSkeleton } from '@/app/components/Animation/Cards';
import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/shop/BannerSection';
import { redirect, useSearchParams } from 'next/navigation';

const SearchPage = dynamic(() => import('@/app/components/Pages/FRONT_END/shop/SearchPage').then((mod) => mod.SearchPage));

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
  <Suspense
    fallback={
      <div className="my-4 h-screen flex items-center justify-center">
        <PageSkeleton />
      </div>
    }
  >
    <SearchContent />
  </Suspense>
);

export default Search;
