import BrowseDestinationsSection from '../home/BrowseDestinationsSection';

export default function TrendingSpots({ cities }) {
  return (
    <div className="bg-[#F5F9FA] pt-12 sm:pt-16">
      <BrowseDestinationsSection cities={cities} title="Trending Spots" subtitleMode="price" navigationPrefix="trending-spots" />
    </div>
  );
}
