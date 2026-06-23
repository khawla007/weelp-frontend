export default function ToursHeroDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Top-left corner cluster */}
      <svg className="absolute -left-12 -top-12 h-[240px] w-[320px] text-weelp-sage-deep sm:h-[360px] sm:w-[460px]" viewBox="0 0 460 360" focusable="false" role="presentation">
        <defs>
          <pattern id="tours-hero-dotgrid-tl" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="3" fill="currentColor" fillOpacity="0.55" />
          </pattern>
        </defs>
        <path d="M-10,10 C160,-10 280,80 260,200 C240,300 140,360 60,330 C-20,310 -80,220 -70,140 C-60,80 -40,40 -10,10 Z" fill="currentColor" fillOpacity="0.85" />
        <path d="M30,40 C200,20 320,110 300,230 C280,330 180,390 100,360 C20,340 -40,250 -30,170 C-20,110 0,70 30,40 Z" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2" />
        <rect x="280" y="100" width="100" height="100" fill="url(#tours-hero-dotgrid-tl)" />
        <circle cx="200" cy="240" r="10" fill="none" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.6" />
        <circle cx="80" cy="320" r="6" fill="currentColor" fillOpacity="0.8" />
      </svg>

      {/* Top-right corner cluster */}
      <svg className="absolute -right-12 -top-12 h-[220px] w-[300px] text-weelp-sage-deep sm:h-[340px] sm:w-[440px]" viewBox="0 0 440 340" focusable="false" role="presentation">
        <circle cx="380" cy="20" r="200" fill="currentColor" fillOpacity="0.35" />
        <circle cx="320" cy="100" r="150" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2" />
        <circle cx="410" cy="240" r="14" fill="currentColor" fillOpacity="0.95" />
        <path d="M260,280 Q300,264 340,280 T420,280" fill="none" stroke="currentColor" strokeOpacity="0.65" strokeWidth="2.2" />
        <path d="M260,300 Q300,284 340,300 T420,300" fill="none" stroke="currentColor" strokeOpacity="0.65" strokeWidth="2.2" />
      </svg>

      {/* Bottom-left corner cluster (bottom-right reserved for AnimatedGlobe) */}
      <svg className="absolute -bottom-10 -left-12 h-[180px] w-[320px] text-weelp-sage-deep sm:h-[240px] sm:w-[440px]" viewBox="0 0 440 240" focusable="false" role="presentation">
        <path d="M-40,200 C40,100 180,90 280,160 C340,210 320,300 240,320 C140,340 20,300 -40,270 C-90,240 -90,220 -40,200 Z" fill="currentColor" fillOpacity="0.45" />
        <circle cx="160" cy="40" r="8" fill="currentColor" fillOpacity="0.85" />
        <path d="M120,80 Q220,50 320,100 T420,140" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2" />
      </svg>
    </div>
  );
}
