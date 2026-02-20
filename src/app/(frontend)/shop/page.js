'use client';

import React from 'react';
import BannerSection from '@/app/components/Pages/FRONT_END/shop/BannerSection';
import { ShopPageSearch, ShopPageSearchResult } from '@/app/components/Pages/FRONT_END/shop/SearchPage';
import Shoppage from '@/app/components/Pages/FRONT_END/shop/shoppagefilter/Shoppage';
import { useSearchParams } from 'next/navigation';
import { log } from '@/lib/utils';
import ShopFilter from '@/app/components/Pages/FRONT_END/shop/ShopPage';
import { ShopAllProduct } from '@/app/components/Pages/FRONT_END/shop/ShopAll';

const ShopPage = () => {
  return (
    <>
      {/* <BannerSection /> */}
      <ShopAllProduct />
    </>
  );
};

export default ShopPage;
