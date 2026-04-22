/** This File Will Handle Activity Page under City context */

import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import SingleProductTabSection from '@/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection';
import { notFound, permanentRedirect } from 'next/navigation';
import { getSingleActivity, getRandomSimilarActivities } from '@/lib/services/activites';
import { isEmpty } from 'lodash';
import AffiliateTracker from '@/app/components/AffiliateTracker';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { data: activityData = [] } = await getSingleActivity(slug);

  const { name, description } = activityData;

  // Compute canonical city slug for metadata
  const citySlugs = (activityData?.locations || []).map((l) => l?.city_slug).filter(Boolean);
  const primary = activityData?.locations?.find((l) => l?.location_type === 'primary' && l?.city_slug);
  const canonicalCitySlug = primary?.city_slug ?? citySlugs[0];

  return {
    title: name || '',
    description: description || '',
    ...(canonicalCitySlug && {
      alternates: {
        canonical: `/cities/${canonicalCitySlug}/activities/${slug}`,
      },
    }),
  };
}

export default async function SingleActivityPage({ params, searchParams }) {
  const { city, slug } = await params;
  const { ref } = await searchParams;

  const { data: activityData = [] } = await getSingleActivity(slug);

  // if activity not found
  if (isEmpty(activityData)) {
    notFound();
  }

  // Enforce city-activity binding: validate that activity exists in the requested city
  const citySlugs = (activityData?.locations || []).map((l) => l?.city_slug).filter(Boolean);

  // If activity has no bindable cities, return 404
  if (citySlugs.length === 0) {
    notFound();
  }

  // Compute canonical city slug (primary location or first available)
  const primary = activityData.locations.find((l) => l?.location_type === 'primary' && l?.city_slug);
  const canonicalCitySlug = primary?.city_slug ?? citySlugs[0];

  // If the URL city param does not match any of the activity's cities, redirect to canonical URL
  if (!citySlugs.includes(city)) {
    permanentRedirect(`/cities/${canonicalCitySlug}/activities/${slug}`);
  }

  const {
    id,
    name,
    description,
    item_type,
    pricing: { regular_price },
    media_gallery,
    review_summary,
    locations,
  } = activityData;

  // Get main location (location_type='primary' AND location_label='Main Location')
  const primaryLocation = locations?.find((l) => l.location_type === 'primary' && l.location_label === 'Main Location') || locations?.[0] || null;

  // Fetch 2 random similar activities from the same city, excluding current activity
  const similarActivities = await getRandomSimilarActivities(city, id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': item_type,
    name: name,
    description: description,
  };

  return (
    <>
      <AffiliateTracker creatorId={ref} />
      <BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={review_summary} primaryLocation={primaryLocation} city={city} />
      <SingleProductTabSection productType="activity" productId={id} productData={activityData} similarActivities={similarActivities} activitySlug={slug} />

      {/* Add JSON-LD to your page */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
