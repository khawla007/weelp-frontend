'use client';

import { useState } from 'react';
import Image from 'next/image';
import Reveal from '@/app/components/ui/Reveal';

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
    <Reveal as="section" className="container-page pb-10 md:pb-16 lg:pb-24">
      <h2 className="mb-12 text-center text-[28px] text-[#18181b] md:text-[28px]">Meet the Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member, index) => (
          <div
            key={index}
            className="bg-white rounded-[24px] p-4 border border-[#e4e4e7] text-center transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)]"
          >
            <div className="relative w-full aspect-square mb-4 rounded-[16px] bg-[#f4f4f5] overflow-hidden">
              {!imageErrors[index] ? (
                <Image src={member.image} alt={member.name} fill className="object-cover" onError={() => handleImageError(index)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#f4f4f5]">
                  <span className="text-[#71717a] text-4xl">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <h3 className="mb-1 text-lg text-[#18181b]">{member.name}</h3>
            <p className="text-sm font-normal leading-[1.5] text-[#71717a]">{member.role}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
};

export default AboutTeam;
