import { Target, Eye } from 'lucide-react';

const headlineFont = { fontFamily: 'var(--font-plus-jakarta), Plus Jakarta Sans, sans-serif', fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.15 };
const bodyFont = { fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 400, lineHeight: 1.6 };

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
    <section className="container mx-auto px-4 py-[70px]">
      <h2 className="text-[28px] md:text-[32px] text-[#18181b] text-center mb-12" style={headlineFont}>
        Our Purpose
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-[24px] p-8 border border-[#e4e4e7] transition-shadow duration-300 hover:shadow-[0_14px_30px_rgba(24,24,27,0.1)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-[#588f7a]">
                  <Icon size={32} />
                </div>
                <div>
                  <h3 className="text-xl text-[#18181b] mb-3" style={headlineFont}>
                    {card.title}
                  </h3>
                  <p className="text-base text-[#71717a] max-w-[65ch]" style={bodyFont}>
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AboutMission;
