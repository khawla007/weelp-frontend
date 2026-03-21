'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const BreadcrumbItem = ({ href, children, isLast = false, isCurrent = false }) => {
  return (
    <li className="flex items-center">
      <Link
        href={href}
        className={cn('text-sm hover:text-brand-600 transition-colors', isCurrent ? 'font-medium text-brand-600' : 'text-gray-600', isLast && 'hover:underline')}
        aria-current={isCurrent ? 'page' : undefined}
      >
        {children}
      </Link>
      {!isLast && <ChevronRight className="mx-2 h-4 w-4 text-gray-400" aria-hidden="true" />}
    </li>
  );
};

export function Breadcrumb({ items, homeHref = '/' }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2" aria-label="Breadcrumb navigation">
      <ol className="flex items-center" role="list">
        {/* Home item */}
        <li className="flex items-center">
          <Link href={homeHref} className="text-sm text-gray-600 hover:text-brand-600 transition-colors flex items-center" aria-label="Home">
            <Home className="h-4 w-4 mr-1" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
          {items.length > 0 && <ChevronRight className="mx-2 h-4 w-4 text-gray-400" aria-hidden="true" />}
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <BreadcrumbItem key={index} href={item.href} isLast={isLast} isCurrent={item.isCurrent}>
              {item.label}
            </BreadcrumbItem>
          );
        })}
      </ol>
    </nav>
  );
}

// Simplified breadcrumb for pages
export function SimpleBreadcrumb({ items, separator = '/' }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center text-sm text-gray-600 py-2" aria-label="Breadcrumb">
      <ol className="flex items-center" role="list">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400" aria-hidden="true">
                {separator}
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className={cn('hover:text-brand-600 transition-colors', item.isCurrent ? 'font-medium text-brand-600' : '')} aria-current={item.isCurrent ? 'page' : undefined}>
                {item.label}
              </Link>
            ) : (
              <span className={item.isCurrent ? 'font-medium text-brand-600' : ''}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
