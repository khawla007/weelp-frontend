import BrowseDestinationsSection from '../home/BrowseDestinationsSection';

export default function TrendingSpots({ cities }) {
  return (
    <div className="bg-[#f8faf9] pt-12 sm:pt-16">
      <BrowseDestinationsSection cities={cities} title="Trending Spots" subtitleMode="price" navigationPrefix="trending-spots" />
    </div>
  );
}
