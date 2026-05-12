import { Heart, Sparkles, Lightbulb, Shield } from 'lucide-react';

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
      <h2 className="mb-12 text-center text-[28px] text-[#18181b] md:text-[28px]">Our Values</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value, index) => {
          const Icon = value.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-[24px] p-6 border border-[#e4e4e7] text-center transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)]"
            >
              <div className="flex justify-center mb-4 text-[#588f7a]">
                <Icon size={32} />
              </div>
              <h3 className="mb-2 text-lg text-[#18181b]">{value.title}</h3>
              <p className="text-sm font-normal leading-[1.6] text-[#71717a]">{value.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AboutValues;
