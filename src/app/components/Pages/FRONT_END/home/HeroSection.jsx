import React from 'react';
import { MapPin, Calendar, Users } from 'lucide-react';
import Form from '../../../Form/Form';

const HereSection = () => {
  return (
    <section
      className="banner grid place-items-center h-[60vh] mb-12 xl:mb-0"
      style={{
        backgroundImage: 'url(/assets/images/Frame.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full sm:px-4">
        <div className="flex flex-col gap-3 pb-4">
          <h1 className="font-bold  text-xl sm:text-4xl text-center text-Blueish">Plan and Book</h1>
          <p className="text-gray-500 mx-auto text-center  text-sm sm:text-2xl font-medium capitalize">The best experiences around you.</p>
        </div>
        <Form />
      </div>
    </section>
  );
};

export default HereSection;
