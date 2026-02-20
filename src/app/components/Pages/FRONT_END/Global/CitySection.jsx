import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';

const CitySection = ({ data }) => {
  if (data && data.length > 0) {
    return (
      <section className="container mx-auto grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 px-6 py-4 sm:py-12">
        {data &&
          data.length > 0 &&
          data.slice(0, 6).map(({ name, icon: Icon }, index) => (
            <Card key={index} className="w-full sm:max-w-xs h-32 flex flex-col shadow-sm justify-center items-center p-4 bg-white rounded-lg">
              {<Icon />}
              <CardTitle className="capitalize text-center text-lg font-semibold text-[#143042] mt-4">{name}</CardTitle>
            </Card>
          ))}
      </section>
    );
  }
};

export default CitySection;
