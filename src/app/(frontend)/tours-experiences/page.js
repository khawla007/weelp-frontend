import BrowseDestinationsSection from '@/app/components/Pages/FRONT_END/home/BrowseDestinationsSection';
import ToursHero from '@/app/components/Pages/FRONT_END/tours/ToursHero';
import { getFeaturedCitiesWithStartingPrice } from '@/lib/services/tours';

export const metadata = {
  title: 'Tours & Experiences | Weelp',
  description: 'Plan your holiday — search tours and experiences across destinations.',
};

export default async function ToursExperiencesPage() {
  let cities = [];
  try {
    cities = await getFeaturedCitiesWithStartingPrice();
  } catch {
    cities = [];
  }
  return (
    <main>
      <ToursHero />
      <BrowseDestinationsSection cities={cities} title="Trending Spots" subtitleMode="price" navigationPrefix="trending-spots" />
    </main>
  );
}
