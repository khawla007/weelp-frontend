import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import Reveal from '@/app/components/ui/Reveal';

const CitySection = ({ data }) => {
  if (data && data.length > 0) {
    return (
      <Reveal as="section" initialHidden stagger={60} className="container-page grid grid-cols-2 gap-3 pb-7 sm:grid-cols-3 md:gap-4 md:pb-16 lg:grid-cols-6 lg:pb-24">
        {data.slice(0, 6).map(({ name, icon: Icon }, index) => (
          <Card
            key={index}
            className="flex h-20 w-full flex-col items-center justify-center rounded-[var(--weelp-card-radius)] border border-[var(--weelp-card-border)] bg-background p-3 shadow-[0_0_0] transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)] dark:shadow-none dark:hover:shadow-none sm:max-w-xs md:h-28 md:p-4 lg:h-32"
          >
            {<Icon />}
            <CardTitle className="mt-2 text-center text-xs font-bold capitalize text-[var(--weelp-home-ink)] md:mt-4 md:text-base lg:text-lg">{name}</CardTitle>
          </Card>
        ))}
      </Reveal>
    );
  }
};

export default CitySection;
