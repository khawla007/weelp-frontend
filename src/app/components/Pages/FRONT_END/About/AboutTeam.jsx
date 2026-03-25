'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

const AboutTeam = () => {
  const team = [
    { name: 'John Smith', role: 'Founder & CEO', image: '/assets/images/team-1.jpg' },
    { name: 'Sarah Johnson', role: 'CTO', image: '/assets/images/team-2.jpg' },
    { name: 'Michael Chen', role: 'Head of Operations', image: '/assets/images/team-3.jpg' },
    { name: 'Emily Davis', role: 'Marketing Lead', image: '/assets/images/team-4.jpg' },
  ];

  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <section className="container mx-auto px-4 py-[70px]">
      <h2 className="text-[28px] font-medium text-center mb-12" style={{ fontFamily: fontIT, color: '#273F4E' }}>
        Meet the Team
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member, index) => (
          <div key={index} className="bg-white rounded-[28px] p-4 shadow-[0_3px_9px_rgba(0,0,0,0.04)] text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="relative w-full aspect-square mb-4 rounded-[28px] bg-gray-200 overflow-hidden">
              {!imageErrors[index] ? (
                <Image src={member.image} alt={member.name} fill className="object-cover" onError={() => handleImageError(index)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400 text-4xl">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: fontIT, color: '#0c2536' }}>
              {member.name}
            </h3>
            <p className="text-sm" style={{ fontFamily: fontIT, color: '#667085' }}>
              {member.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutTeam;
