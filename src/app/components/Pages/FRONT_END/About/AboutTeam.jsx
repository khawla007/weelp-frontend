'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Users } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';
import SectionBadge from './SectionBadge';

const team = [
  { name: 'John Smith', role: 'Founder & CEO', image: '/assets/images/team-1.jpg' },
  { name: 'Sarah Johnson', role: 'Chief Technology Officer', image: '/assets/images/team-2.jpg' },
  { name: 'Michael Chen', role: 'Head of Operations', image: '/assets/images/team-3.jpg' },
  { name: 'Emily Davis', role: 'Marketing Lead', image: '/assets/images/team-4.jpg' },
  { name: 'David Thompson', role: 'Head of Partnerships', image: '/assets/images/user.png' },
  { name: 'Jessica Williams', role: 'Customer Success Lead', image: '/assets/images/user.png' },
];

const AboutTeam = () => {
  const [imageErrors, setImageErrors] = useState({});
  const handleImageError = (index) => setImageErrors((prev) => ({ ...prev, [index]: true }));

  return (
    <section className="container-page pb-10 md:pb-16 lg:pb-24">
      <div className="mb-12 flex flex-col items-center text-center">
        <SectionBadge icon={Users}>Our Team</SectionBadge>
        <h2 className="mt-4 text-foreground">Meet the people behind Weelp</h2>
        <p className="mt-2 max-w-[46ch] text-muted-foreground">A small, dedicated team of travelers building the experiences we&apos;d want ourselves.</p>
      </div>
      <Reveal initialHidden stagger={60} variant="lift" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member, index) => (
          <div
            key={member.name}
            className="rounded-[24px] border border-border bg-background p-4 text-center transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)] dark:hover:shadow-none"
          >
            <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-[16px] bg-muted">
              {!imageErrors[index] ? (
                <Image src={member.image} alt={member.name} fill className="object-cover" onError={() => handleImageError(index)} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-4xl text-muted-foreground">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <h3 className="mb-1 text-lg text-foreground">{member.name}</h3>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
};

export default AboutTeam;
