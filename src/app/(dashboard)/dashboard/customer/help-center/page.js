import React from 'react';
import Image from 'next/image';

const HelpCenter = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#f5f9fa]">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        {/* Weelp Logo */}
        <div className="relative w-32 h-32">
          <Image src="/assets/images/SiteLogo.png" alt="Weelp" fill className="object-contain" priority />
        </div>

        {/* Coming Soon Text */}
        <h1 className="text-4xl font-semibold text-Blueish">Coming Soon</h1>

        {/* Optional subtitle */}
        <p className="text-lg text-grayDark">We&apos;re working on something amazing. Stay tuned!</p>
      </div>
    </div>
  );
};

export default HelpCenter;
