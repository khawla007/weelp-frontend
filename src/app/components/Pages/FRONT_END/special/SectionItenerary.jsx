import React from 'react';
import ItineraryCard from '@/app/components/IterinaryCard';
import Reveal from '@/app/components/ui/Reveal';
const SectionItenerary = ({ sliderTitle }) => {
  return (
    <section className="container mx-auto flex flex-col gap-3 p-4 sm:my-8 ">
      <Reveal as="h2" initialHidden variant="lift" className="text-xl sm:text-[28px] mb-4 font-medium text-foreground capitalize">
        {sliderTitle || 'Top activities'}
      </Reveal>
      <Reveal initialHidden variant="lift" delay={120}>
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
      </Reveal>
    </section>
  );
};

export default SectionItenerary;
