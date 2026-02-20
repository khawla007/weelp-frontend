import React from 'react';
import ItineraryCard from '@/app/components/IterinaryCard';
const SectionItenerary = ({ sliderTitle }) => {
  return (
    <section className="container mx-auto flex flex-col gap-3 p-4 sm:my-8 ">
      <h2 className="text-xl sm:text-[28px] mb-4 font-medium text-Nileblue capitalize">{sliderTitle || 'Top activities'}</h2>
      <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((value, index) => {
            return (
              <li key={index}>
                <ItineraryCard ke productTitle={'3N 4D in London'} category={'Itinerary'} imgsrc={`https://picsum.photos/300/200?random=1${index}`} />
              </li>
            );
          })}
      </ul>
    </section>
  );
};

export default SectionItenerary;
