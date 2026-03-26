import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { notFound } from 'next/navigation';
import { getSinglePackage } from '@/lib/services/package';
import { isEmpty } from 'lodash';

const SingleProductTabSection = dynamic(() => import('@/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection'));

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

  const { id, name, media_gallery = [], review_summary } = packageData;

  return (
    <>
      <BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={review_summary} />
      <SingleProductTabSection productType="package" productId={id} productData={packageData} packageSlug={pack} />
    </>
  );
}
