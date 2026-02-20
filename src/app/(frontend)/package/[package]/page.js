import React from 'react';
import { log } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/axiosInstance';
import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { TabSectionPackage } from '@/app/components/Pages/FRONT_END/singleproduct/TabSection';
import { getSinglePackage } from '@/lib/services/package';
import { isEmpty } from 'lodash';

export async function generateMetadata({ params }) {
  const { package: pack } = await params;
  const { data: packageData = [] } = await getSinglePackage(pack);

  if (!isEmpty(packageData)) {
    const { name, description } = packageData;

    return {
      title: name,
      description,
    };
  }
}

export default async function PackagePage({ params }) {
  const { package: pack } = await params;
  const { data: packageData = [] } = await getSinglePackage(pack);

  // Check if packageData is null or empty
  if (!packageData || packageData.length === 0) {
    notFound();
  }
  const { name, media_gallery = [] } = packageData;

  return (
    <>
      <BannerSection activityName={name} media_gallery={media_gallery} />
      <TabSectionPackage productData={packageData} />
    </>
  );
}
