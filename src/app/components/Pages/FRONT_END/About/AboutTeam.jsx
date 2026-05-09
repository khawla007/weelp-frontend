'use client';

import { useState } from 'react';
import Image from 'next/image';

const headlineFont = { fontFamily: 'var(--font-plus-jakarta), Plus Jakarta Sans, sans-serif', fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.15 };
const bodyFont = { fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 400, lineHeight: 1.5 };

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
      <h2 className="text-[28px] md:text-[32px] text-[#18181b] text-center mb-12" style={headlineFont}>
        Meet the Team
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member, index) => (
          <div key={index} className="bg-white rounded-[24px] p-4 border border-[#e4e4e7] text-center transition-shadow duration-300 hover:shadow-[0_14px_30px_rgba(24,24,27,0.1)]">
            <div className="relative w-full aspect-square mb-4 rounded-[16px] bg-[#f4f4f5] overflow-hidden">
              {!imageErrors[index] ? (
                <Image src={member.image} alt={member.name} fill className="object-cover" onError={() => handleImageError(index)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#f4f4f5]">
                  <span className="text-[#71717a] text-4xl">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <h3 className="text-lg text-[#18181b] mb-1" style={headlineFont}>
              {member.name}
            </h3>
            <p className="text-sm text-[#71717a]" style={bodyFont}>
              {member.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutTeam;
