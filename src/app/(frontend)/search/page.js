'use client';
import React, { Suspense } from 'react';
import { PageSkeleton } from '@/app/components/Animation/Cards';
import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/shop/BannerSection';

const SearchPage = dynamic(() => import('@/app/components/Pages/FRONT_END/shop/SearchPage').then((mod) => mod.SearchPage));

const SearchContent = () => {
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
