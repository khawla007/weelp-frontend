/** This File Will Handle Activity Page under City context */

import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import SingleProductTabSection from '@/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection';
import { notFound } from 'next/navigation';
import { getSingleActivity, getRandomSimilarActivities } from '@/lib/services/activites';
import { isEmpty } from 'lodash';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { data: activityData = [] } = await getSingleActivity(slug);

  const { name, description } = activityData;

  return {
    title: name || '',
    description: description || '',
  };
}

export default async function SingleActivityPage({ params }) {
  const { city, slug } = await params;

  const { data: activityData = [] } = await getSingleActivity(slug);

  // if activity not found
  if (isEmpty(activityData)) {
    notFound();
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
      <BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={review_summary} primaryLocation={primaryLocation} city={city} />
      <SingleProductTabSection productType="activity" productId={id} productData={activityData} similarActivities={similarActivities} activitySlug={slug} />

      {/* Add JSON-LD to your page */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
