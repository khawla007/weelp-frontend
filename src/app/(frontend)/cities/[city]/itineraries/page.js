import CityItemsListing from '@/app/components/Pages/FRONT_END/city/CityItemsListing';
import { getCityData } from '@/lib/services/cities';

export async function generateMetadata({ params }) {
  const { city } = await params;
  const response = await getCityData(city);
  const cityName = response?.data?.name;

  return {
    title: cityName ? `Itineraries in ${cityName} | Weelp` : 'Itineraries | Weelp',
    description: cityName
      ? `Browse all itineraries in ${cityName}. Find the best travel itineraries and plan your next trip.`
      : 'Browse travel itineraries and plan your next trip on Weelp.',
  };
}

export default async function CityItinerariesPage({ params, searchParams }) {
  const { city } = await params;
  return <CityItemsListing citySlug={city} itemType="itineraries" searchParams={searchParams} />;
}
