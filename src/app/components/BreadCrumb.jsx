'use client';
import React from 'react';
import { useParams, usePathname, useSearchParams } from 'next/navigation';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const BreadCrumb = ({ className }) => {
  const pathName = usePathname();
  const searchparams = useSearchParams();
  const { itinerary } = useParams();

  const pathArray = String(pathName).split('/');

  /** Slugs to remove from display */
  const removedItems = ['', 'region', 'city', 'activity'];

  /** Build breadcrumb items with labels and hrefs */
  const items = [];
  let cumulativePath = '';
  for (const segment of pathArray) {
    if (segment === '') continue;
    cumulativePath += `/${segment}`;
    if (!removedItems.includes(segment)) {
      items.push({ label: segment.replace(/-/g, ' '), href: cumulativePath });
    }
  }

  return (
    <div className={`${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className={'text-base text-[#566872] font-medium last:text-[#566872]'}>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <React.Fragment key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbItem className={'capitalize text-[#566872] text-base font-medium last:font-semibold last:text-[#566872]'}>
                  {isLast ? item.label : <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadCrumb;
