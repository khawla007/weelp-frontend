import { Target, Eye } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';

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
    <Reveal as="section" className="container-page pb-10 md:pb-16 lg:pb-24">
      <h2 className="mb-12 text-center text-[28px] text-[#18181b] md:text-[28px]">Our Purpose</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-[24px] p-8 border border-[#e4e4e7] transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-[#588f7a]">
                  <Icon size={32} />
                </div>
                <div>
                  <h3 className="mb-3 text-xl text-[#18181b]">{card.title}</h3>
                  <p className="max-w-[65ch] text-base font-normal leading-[1.6] text-[#71717a]">{card.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
};

export default AboutMission;
