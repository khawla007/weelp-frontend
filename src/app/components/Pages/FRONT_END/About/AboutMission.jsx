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
    <section className="container-page pb-10 md:pb-16 lg:pb-24">
      <Reveal as="h2" variant="lift" className="mb-12 text-center text-[28px] text-foreground md:text-[28px]">
        Our Purpose
      </Reveal>
      <Reveal initialHidden stagger={60} variant="lift" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-background rounded-[24px] p-8 border border-border transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)] dark:hover:shadow-none"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-weelp-sage-text">
                  <Icon size={32} />
                </div>
                <div>
                  <h3 className="mb-3 text-xl text-foreground">{card.title}</h3>
                  <p className="max-w-[65ch] text-base font-normal leading-[1.6] text-muted-foreground">{card.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
};

export default AboutMission;
