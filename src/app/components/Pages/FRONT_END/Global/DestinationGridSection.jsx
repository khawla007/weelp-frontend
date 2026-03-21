import React from 'react';
import DestinationGridCard from './DestinationGridCard';

const DestinationGridSection = ({ sliderTitle = 'Top Destination', data = [] }) => {
  console.log('DestinationGridSection data:', data);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Title Area */}
        <div className="text-center mb-8">
          <span className="text-sm font-medium text-secondaryDark uppercase tracking-wider">Explore</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-Nileblue mt-2">{sliderTitle}</h2>
        </div>

        {/* Grid of Destinations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {data.slice(0, 4).map((city, index) => (
            <DestinationGridCard key={city.id || index} city={city} isActive={index === 3} />
          ))}
        </div>

        {/* View All Link - TODO: Create /destinations page */}
        {/* <div className="text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondaryDark hover:bg-secondaryLight text-white rounded-lg transition-colors"
          >
            View All
          </Link>
        </div> */}
      </div>
    </section>
  );
};

export default DestinationGridSection;
