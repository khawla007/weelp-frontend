import React from 'react';
import { Target, Eye } from 'lucide-react';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

const AboutMission = () => {
  const cards = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To connect travelers with authentic, memorable experiences while supporting local communities and promoting sustainable tourism worldwide.',
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: "To become the world's most trusted travel companion, making every journey unforgettable and every destination accessible.",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-[70px]">
      <h2 className="text-[28px] font-medium text-center mb-12" style={{ fontFamily: fontIT, color: '#273F4E' }}>
        Our Purpose
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-[28px] p-8 shadow-[0_3px_9px_rgba(0,0,0,0.04)]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0" style={{ color: '#588f7a' }}>
                  <Icon size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: fontIT, color: '#0c2536' }}>
                    {card.title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ fontFamily: fontIT, color: '#667085' }}>
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AboutMission;
