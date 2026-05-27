const AboutStats = () => {
  const stats = [
    { number: '10+', label: 'Years of Experience' },
    { number: '50+', label: 'Destinations' },
    { number: '100K+', label: 'Happy Travelers' },
    { number: '500+', label: 'Experiences' },
  ];

  return (
    <section className="w-full bg-[#f2f7f5] py-10 md:py-16 lg:py-24 mb-10 md:mb-16 lg:mb-24">
      <div className="container-page">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <h3 className="mb-2 text-4xl font-bold tracking-[-0.01em] text-[#588f7a] md:text-5xl">{stat.number}</h3>
              <p className="text-sm font-medium leading-[1.4] text-[#52525b] md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutStats;
