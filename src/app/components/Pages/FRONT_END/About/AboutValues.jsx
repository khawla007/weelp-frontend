import { Heart, Sparkles, Lightbulb, Shield } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';

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
    <section className="container-page pb-10 md:pb-16 lg:pb-24">
      <Reveal as="h2" variant="lift" className="mb-12 text-center text-[28px] text-foreground md:text-[28px]">
        Our Values
      </Reveal>
      <Reveal initialHidden stagger={60} variant="lift" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value, index) => {
          const Icon = value.icon;
          return (
            <div
              key={index}
              className="bg-background rounded-[24px] p-6 border border-border text-center transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)]"
            >
              <div className="flex justify-center mb-4 text-weelp-sage-deep">
                <Icon size={32} />
              </div>
              <h3 className="mb-2 text-lg text-foreground">{value.title}</h3>
              <p className="text-sm font-normal leading-[1.6] text-muted-foreground">{value.description}</p>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
};

export default AboutValues;
