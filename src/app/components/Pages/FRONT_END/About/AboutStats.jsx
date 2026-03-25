import React from 'react';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

const AboutStats = () => {
  const stats = [
    { number: '10+', label: 'Years of Experience' },
    { number: '50+', label: 'Destinations' },
    { number: '100K+', label: 'Happy Travelers' },
    { number: '500+', label: 'Experiences' },
  ];

  return (
    <section className="py-12 px-4" style={{ backgroundColor: '#f2f7f5' }}>
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <h3 className="text-4xl font-bold mb-2" style={{ fontFamily: fontIT, color: '#588f7a' }}>
                {stat.number}
              </h3>
              <p className="text-base" style={{ fontFamily: fontIT, color: '#667085' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutStats;
