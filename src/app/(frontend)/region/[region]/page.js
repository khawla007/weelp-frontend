/** This File will handle Region Page */
import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/region/BannerSection';
import { fakeData } from '@/app/Data/ShopData';
import BreakSection from '@/app/components/BreakSection';
import { notFound } from 'next/navigation';
import { getCitiesByRegion, getRegionDetails } from '@/lib/services/region';
import SharedToursSection from '@/app/components/Pages/FRONT_END/shared/SharedToursSection';

const ReviewSectionRegion = dynamic(() => import('@/app/components/Pages/FRONT_END/Global/ReviewSection').then((mod) => mod.ReviewSectionRegion));
const BrowseDestinationsSection = dynamic(() => import('@/app/components/Pages/FRONT_END/home/BrowseDestinationsSection'));
const GuideSection = dynamic(() => import('@/app/components/Pages/FRONT_END/Global/GuideSection'));
const SharedFilterSection = dynamic(() => import('@/app/components/Pages/FRONT_END/shared/SharedFilterSection'));

//  Region Page Component
export default async function Region({ params }) {
  const { region } = await params;

  // Fetch data before rendering
  const { data: cityData = [] } = await getCitiesByRegion(region);
  const { data: regionDetails = null } = await getRegionDetails(region);
  const regionName = regionDetails?.name || region;

  // Handle 404 Not Found (Prevent Rendering)
  if (!cityData || cityData.length === 0) {
    return notFound();
  }

  // testing schema
  function schemaJsonSample() {
    return {
      __html: `{
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Executive Anvil",
      "image": [
        "https://example.com/photos/1x1/photo.jpg",
        "https://example.com/photos/4x3/photo.jpg",
        "https://example.com/photos/16x9/photo.jpg"
       ],
      "description": "Sleeker than ACME's Classic Anvil, the Executive Anvil is perfect for the business traveler looking for something to drop from a height.",
      "sku": "0446310786",
      "mpn": "925872",
      "brand": {
        "@type": "Brand",
        "name": "ACME"
      },
      "review": {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "4",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Fred Benson"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.4",
        "reviewCount": "89"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/anvil",
        "priceCurrency": "USD",
        "price": "119.99",
        "priceValidUntil": "2020-11-20",
        "itemCondition": "https://schema.org/UsedCondition",
        "availability": "https://schema.org/InStock"
      }
    }
  `,
    };
  }

  return (
    <>
      <BannerSection />
      {/* <CitySection data={whiteCardData} /> */}

      {cityData.length > 0 && <BrowseDestinationsSection cities={cityData} title="Must Visit Cities" subtitleMode="count" navigationPrefix="region-must-visit" className="py-[70px]" />}

      <BreakSection marginTop="m-0 p-0" />

      <SharedToursSection scope="region" slug={region} title={regionName} />

      <BreakSection marginTop="m-0" />

      <SharedFilterSection scope="region" slug={region} />

      <ReviewSectionRegion />
      {/* Blog Section */}
      <GuideSection sectionTitle="Blogs" data={fakeData} className="py-[70px]" />

      <script type="application/ld+json" dangerouslySetInnerHTML={schemaJsonSample()} key="product-jsonld" />
    </>
  );
}
