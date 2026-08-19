// frontend/src/app/components/Pages/FRONT_END/About/SectionBadge.jsx
const SectionBadge = ({ icon: Icon, children, className = '' }) => (
  <span className={`inline-flex items-center gap-2 rounded-full bg-weelp-sage-tint/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-weelp-sage-text ${className}`}>
    {Icon ? <Icon size={15} aria-hidden="true" /> : null}
    {children}
  </span>
);

export default SectionBadge;
