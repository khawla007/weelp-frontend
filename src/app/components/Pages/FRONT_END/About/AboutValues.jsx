import { Heart, Sparkles, Lightbulb, Shield } from 'lucide-react';

const headlineFont = { fontFamily: 'var(--font-plus-jakarta), Plus Jakarta Sans, sans-serif', fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.15 };
const bodyFont = { fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 400, lineHeight: 1.6 };

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
      <h2 className="text-[28px] md:text-[32px] text-[#18181b] text-center mb-12" style={headlineFont}>
        Our Values
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value, index) => {
          const Icon = value.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-[24px] p-6 border border-[#e4e4e7] text-center transition-shadow duration-300 hover:shadow-[0_14px_30px_rgba(24,24,27,0.1)]"
            >
              <div className="flex justify-center mb-4 text-[#588f7a]">
                <Icon size={32} />
              </div>
              <h3 className="text-lg text-[#18181b] mb-2" style={headlineFont}>
                {value.title}
              </h3>
              <p className="text-sm text-[#71717a]" style={bodyFont}>
                {value.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AboutValues;
