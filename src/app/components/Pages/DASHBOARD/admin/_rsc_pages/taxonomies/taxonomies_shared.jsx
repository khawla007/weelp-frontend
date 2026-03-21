// this file will handle all( catogory tags ) titles
'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const TaxonomiesPageTitle = ({ title, description }) => {
  return (
    <Card className={'flex w-full flex-col justify-between bg-inherit border-none shadow-none '}>
      <CardHeader className={'w-full flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:p-0 '}>{title && <CardTitle className={'capitalize'}>{title}</CardTitle>}</CardHeader>
      {description && <CardContent className={'capitalize text-gray-500 sm:px-0'}>{description}</CardContent>}
    </Card>
  );
};

//  Create Form Page Navigation
export const TaxonomyFormNavigation = ({ url, title, description }) => {
  return (
    <Card className="border-none shadow-none bg-inherit">
      <CardHeader className={'flex flex-row space-x-2 space-y-2 items-center'}>
        {url && (
          <Link href={url} className=" hover:bg-slate-50 p-2">
            <ArrowLeft />
          </Link>
        )}
        {title && <CardTitle className={'capitalize text-3xl font-bold'}>{title}</CardTitle>}
      </CardHeader>
      {description && (
        <CardContent className={''}>
          <CardDescription className={'text-base text-[#71717A]'}>{description}</CardDescription>
        </CardContent>
      )}
    </Card>
  );
};
