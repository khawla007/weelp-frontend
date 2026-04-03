/** This File Will Handle Package Page under City context */
import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { notFound } from 'next/navigation';
import { getSinglePackage, getRandomSimilarPackages } from '@/lib/services/package';
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
  const { city, package: pack } = await params;
  const { data: packageData = [] } = await getSinglePackage(pack);

  if (!packageData || packageData.length === 0) {
    notFound();
  }

  const { id, name, media_gallery = [], review_summary, locations = [], schedules = [] } = packageData;

  // Get primary location (first location with city)
  // API returns: locations[0] = { city_id, city: "City Name", state, country, ... }
  const firstLocation = locations?.[0] || null;
  const locationCity = city; // Use route param for city slug since API doesn't provide it in location
  const primaryLocation = firstLocation ? { city: firstLocation.city, location_label: null } : null;

  // Calculate day/night from schedules (e.g., 3 days = 2 nights)
  const totalDays = schedules?.length || 0;
  const totalNights = totalDays > 0 ? totalDays - 1 : 0;
  const scheduleDisplay = totalDays > 0 ? `${totalDays} Day${totalDays > 1 ? 's' : ''} ${totalNights} Night${totalNights !== 1 ? 's' : ''}` : null;

  // Fetch similar packages using the city param
  const similarPackages = locationCity ? await getRandomSimilarPackages(locationCity, id) : [];

  return (
    <>
      <BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={review_summary} primaryLocation={primaryLocation} city={locationCity} scheduleDisplay={scheduleDisplay} />
      <SingleProductTabSection productType="package" productId={id} productData={packageData} packageSlug={pack} similarActivities={similarPackages} />
    </>
  );
}
