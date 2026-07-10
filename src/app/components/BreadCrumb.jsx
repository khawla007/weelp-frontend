'use client';
import React from 'react';
import { usePathname } from 'next/navigation';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import NavigationLink from '@/app/components/Navigation/NavigationLink';

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
          <BreadcrumbItem className={'text-base text-muted-foreground font-medium'}>
            <BreadcrumbLink
              asChild
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm"
            >
              <NavigationLink href="/">Home</NavigationLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <React.Fragment key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbItem className={`capitalize text-base font-medium ${isLast ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                  {isLast ? (
                    item.label
                  ) : (
                    <BreadcrumbLink
                      asChild
                      className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm"
                    >
                      <NavigationLink href={item.href}>{item.label}</NavigationLink>
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
