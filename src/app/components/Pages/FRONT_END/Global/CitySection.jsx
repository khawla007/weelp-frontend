import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';

const CitySection = ({ data }) => {
  if (data && data.length > 0) {
    return (
      <section className="container mx-auto grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 px-6 py-4 sm:py-12">
        {data &&
          data.length > 0 &&
          data.slice(0, 6).map(({ name, icon: Icon }, index) => (
            <Card key={index} className="w-full sm:max-w-xs h-32 flex flex-col justify-center items-center p-4 bg-white rounded-[var(--weelp-card-radius)] border border-[var(--weelp-card-border)] shadow-[0_0_0] hover:shadow-[0_14px_30px_rgba(24,24,27,0.1)] transition-shadow duration-300">
              {<Icon />}
              <CardTitle className="capitalize text-center font-home-heading text-lg font-bold text-[var(--weelp-home-ink)] mt-4">{name}</CardTitle>
            </Card>
          ))}
      </section>
    );
  }
};

export default CitySection;
