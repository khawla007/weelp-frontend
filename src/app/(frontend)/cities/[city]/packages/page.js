import CityItemsListing from '@/app/components/Pages/FRONT_END/city/CityItemsListing';
import { getCityData } from '@/lib/services/cities';

export async function generateMetadata({ params }) {
  const { city } = await params;
  const response = await getCityData(city);
  const cityName = response?.data?.name;

  return {
    title: cityName ? `Packages in ${cityName} | Weelp` : 'Packages | Weelp',
    description: cityName ? `Browse all packages in ${cityName}. Find the best travel packages and book your next adventure.` : 'Browse travel packages and book your next adventure on Weelp.',
  };
}

export default async function CityPackagesPage({ params, searchParams }) {
  const { city } = await params;
  return <CityItemsListing citySlug={city} itemType="packages" searchParams={searchParams} />;
}
