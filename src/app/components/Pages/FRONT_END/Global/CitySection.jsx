import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import Reveal from '@/app/components/ui/Reveal';

const CitySection = ({ data }) => {
  if (data && data.length > 0) {
    return (
      <Reveal as="section" initialHidden stagger={60} className="container-page grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 pb-10 md:pb-16 lg:pb-24">
        {data.slice(0, 6).map(({ name, icon: Icon }, index) => (
          <Card
            key={index}
            className="w-full sm:max-w-xs h-24 md:h-28 lg:h-32 flex flex-col justify-center items-center p-4 bg-background rounded-[var(--weelp-card-radius)] border border-[var(--weelp-card-border)] shadow-[0_0_0] hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)] transition-shadow duration-300"
          >
            {<Icon />}
            <CardTitle className="capitalize text-center text-sm md:text-base lg:text-lg font-bold text-[var(--weelp-home-ink)] mt-4">{name}</CardTitle>
          </Card>
        ))}
      </Reveal>
    );
  }
};

export default CitySection;
