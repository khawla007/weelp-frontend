import BrowseDestinationsSection from '../home/BrowseDestinationsSection';

const TrendingSection = ({ cities = [] }) => {
  return (
    <div className="w-full bg-[#f8faf9] pt-10 md:pt-16 lg:pt-24 mb-10 md:mb-16 lg:mb-24">
      <BrowseDestinationsSection cities={cities} title="Trending Spots" subtitleMode="count" navigationPrefix="holiday-trending-spots" />
    </div>
  );
};

export default TrendingSection;
