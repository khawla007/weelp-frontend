import React from 'react';
import { Heart, Sparkles, Lightbulb, Shield } from 'lucide-react';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

const AboutValues = () => {
  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Putting travelers at the heart of everything we do.',
    },
    {
      icon: Sparkles,
      title: 'Authenticity',
      description: 'Real experiences, real connections, real memories.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Constantly improving with technology and creativity.',
    },
    {
      icon: Shield,
      title: 'Sustainability',
      description: 'Responsible travel for future generations.',
    },
  ];

  return (
    <section className="container mx-auto px-4 py-[70px]">
      <h2 className="text-[28px] font-medium text-center mb-12" style={{ fontFamily: fontIT, color: '#273F4E' }}>
        Our Values
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value, index) => {
          const Icon = value.icon;
          return (
            <div key={index} className="bg-white rounded-[28px] p-6 shadow-[0_3px_9px_rgba(0,0,0,0.04)] text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex justify-center mb-4" style={{ color: '#588f7a' }}>
                <Icon size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: fontIT, color: '#0c2536' }}>
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ fontFamily: fontIT, color: '#667085' }}>
                {value.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AboutValues;
