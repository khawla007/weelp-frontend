export default function SectionHeader({ superTitle, title, subtitle, titleSize, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {superTitle && <span className="text-[14px] font-semibold tracking-[0.2px] text-muted-foreground">{superTitle}</span>}
      <h2 className={`text-lg ${titleSize === 'lg' ? 'sm:text-[36px]' : 'sm:text-[28px]'} text-foreground`}>{title}</h2>
      {subtitle && <p className="max-w-[520px] text-sm font-medium leading-[1.5] text-muted-foreground sm:text-base">{subtitle}</p>}
    </div>
  );
}
