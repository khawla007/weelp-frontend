import React from 'react';

const CurateSection = () => {
  // Sample profile images array
  const profiles = [
    { id: 1, image: '/assets/images/testimonial.png' },
    { id: 2, image: '/assets/images/testimonial.png' },
    { id: 3, image: '/assets/images/testimonial.png' },
    { id: 4, image: '/assets/images/testimonial.png' },
    { id: 5, image: '/assets/images/testimonial.png' },
    { id: 6, image: '/assets/images/testimonial.png' },
  ];
  return (
    <section style={{ backgroundImage: `url(${'/assets/images/greenimage.png'})` }} className="w-full h-96 bg-center">
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center mt-10 min-h-[300px] px-4">
        {/* Profile pictures row */}
        <div className="flex -space-x mb-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
              <img src={profile.image} alt={`Profile ${profile.id}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-lg mb-4 font-medium">Be among 400+ other wanderers!</p>
      </div>
    </section>
  );
};

export default CurateSection;
