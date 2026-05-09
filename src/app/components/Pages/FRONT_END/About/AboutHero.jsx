const AboutHero = () => {
  return (
    <section className="relative flex items-center justify-center h-[400px] md:h-[500px] bg-[#f2f7f5]">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <h1 className="font-degular text-[40px] md:text-[56px] text-[#18181b] mb-3" style={{ fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.05 }}>
          About Weelp
        </h1>
        <p className="text-[18px] md:text-[22px] text-[#71717a] max-w-[640px]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 400, lineHeight: 1.5 }}>
          Connecting travelers with unforgettable experiences worldwide
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
