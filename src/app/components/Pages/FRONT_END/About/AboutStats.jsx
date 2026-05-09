const headlineFont = { fontFamily: 'var(--font-plus-jakarta), Plus Jakarta Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.05 };
const bodyFont = { fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 500, lineHeight: 1.4 };

const AboutStats = () => {
  const stats = [
    { number: '10+', label: 'Years of Experience' },
    { number: '50+', label: 'Destinations' },
    { number: '100K+', label: 'Happy Travelers' },
    { number: '500+', label: 'Experiences' },
  ];

  return (
    <section className="py-12 px-4 bg-[#f2f7f5]">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <h3 className="text-4xl md:text-5xl text-[#588f7a] mb-2" style={headlineFont}>
                {stat.number}
              </h3>
              <p className="text-sm md:text-base text-[#52525b]" style={bodyFont}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutStats;
