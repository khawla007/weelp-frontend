'use client';

/**
 * UniversalLoader - ONE unified loader for entire website
 * Full white background (0.7 opacity)
 * Weelp logo + old loader animation (shadowPulse dots) in the MIDDLE of the page
 */
export default function UniversalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white/70 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <img
          src="/assets/images/SiteLogo.png"
          alt="Weelp"
          className="h-16 w-auto"
        />
        <span className="loader"></span>
      </div>
    </div>
  );
}
