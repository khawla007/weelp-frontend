import React from 'react';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

const AboutHero = () => {
  return (
    <section className="relative flex items-center justify-center h-[400px] md:h-[500px]" style={{ backgroundColor: '#d9ede2' }}>
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-[32px] md:text-[38px] font-semibold mb-3" style={{ fontFamily: fontIT, color: '#0c2536' }}>
          About Weelp
        </h1>
        <p className="text-[20px] md:text-[29px] font-medium" style={{ fontFamily: fontIT, color: '#667085' }}>
          Connecting travelers with unforgettable experiences worldwide
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
