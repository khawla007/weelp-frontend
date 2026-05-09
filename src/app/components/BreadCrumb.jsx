'use client';
import React from 'react';
import { usePathname } from 'next/navigation';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const BreadCrumb = ({ className }) => {
  const pathName = usePathname();

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
          <BreadcrumbItem className={'text-base text-[#71717a] font-medium'}>
            <BreadcrumbLink
              href="/"
              className="transition-colors hover:text-[#18181b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm"
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <React.Fragment key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbItem className={`capitalize text-base font-medium ${isLast ? 'text-[#18181b] font-semibold' : 'text-[#71717a]'}`}>
                  {isLast ? (
                    item.label
                  ) : (
                    <BreadcrumbLink
                      href={item.href}
                      className="transition-colors hover:text-[#18181b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm"
                    >
                      {item.label}
                    </BreadcrumbLink>
                  )}
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
