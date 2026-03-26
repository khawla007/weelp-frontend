/** This File Will Handle Package Page under City context */

import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import SingleProductTabSection from '@/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection';
import { notFound } from 'next/navigation';
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

  if (!packageData || packageData.length === 0) {
    notFound();
  }
  const { name, media_gallery = [] } = packageData;

  return (
    <>
      <BannerSection activityName={name} media_gallery={media_gallery} />
      <SingleProductTabSection productData={packageData} />
    </>
  );
}
