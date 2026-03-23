export default function SectionHeader({ superTitle, title, subtitle, titleSize, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {superTitle && (
        <span className="text-[14px] text-[#6f7680]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600, letterSpacing: '0.2px' }}>
          {superTitle}
        </span>
      )}
      <h2
        className={`text-lg ${titleSize === 'lg' ? 'sm:text-[36px]' : 'sm:text-[28px]'} text-[#273f4e]`}
        style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: titleSize === 'lg' ? 600 : 500 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-[#6f7680] max-w-[520px]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 500, lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
