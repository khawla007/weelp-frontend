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
    <section className="container-page pb-10 md:pb-16 lg:pb-24">
      <Reveal as="h2" variant="lift" className="mb-12 text-center text-[28px] text-foreground md:text-[28px]">
        Meet the Team
      </Reveal>
      <Reveal initialHidden stagger={60} variant="lift" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member, index) => (
          <div
            key={index}
            className="bg-background rounded-[24px] p-4 border border-border text-center transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)] dark:hover:shadow-none"
          >
            <div className="relative w-full aspect-square mb-4 rounded-[16px] bg-muted overflow-hidden">
              {!imageErrors[index] ? (
                <Image src={member.image} alt={member.name} fill className="object-cover" onError={() => handleImageError(index)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground text-4xl">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <h3 className="mb-1 text-lg text-foreground">{member.name}</h3>
            <p className="text-sm font-normal leading-[1.5] text-muted-foreground">{member.role}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
};

export default AboutTeam;
