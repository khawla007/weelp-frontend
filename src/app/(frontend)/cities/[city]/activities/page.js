import CityItemsListing from '@/app/components/Pages/FRONT_END/city/CityItemsListing';
import { getCityData } from '@/lib/services/cities';

export async function generateMetadata({ params }) {
  const { city } = await params;
  const response = await getCityData(city);
  const cityName = response?.data?.name;

  return {
    title: cityName ? `Activities in ${cityName} | Weelp` : 'Activities | Weelp',
    description: cityName ? `Browse all activities in ${cityName}. Find the best things to do and book your next adventure.` : 'Browse activities and find the best things to do on Weelp.',
  };
}

export default async function CityActivitiesPage({ params, searchParams }) {
  const { city } = await params;
  return <CityItemsListing citySlug={city} itemType="activities" searchParams={searchParams} />;
}
