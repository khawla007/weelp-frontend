'use client';
import React from 'react';
import { useParams, usePathname, useSearchParams } from 'next/navigation';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const BreadCrumb = ({ className }) => {
  const pathName = usePathname();
  const searchparams = useSearchParams();
  const { itinerary } = useParams();
  const r = searchparams.get('r') ?? '';

  const pathArray = String(pathName).split('/');

  /** Slug That i Want to remove */
  const removedItems = ['', 'region', 'city', 'activity', itinerary];

  const absoluteSlugs = pathArray.filter((item) => !removedItems.includes(item));
  return (
    <div className={`${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className={'text-base text-[#566872] font-medium last:text-[#566872]'}>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          {absoluteSlugs.map((val, index) => {
            return (
              <React.Fragment key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbItem className={'capitalize text-[#566872] text-base font-medium last:font-semibold last:text-[#566872]'}>{val}</BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadCrumb;
