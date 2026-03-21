'use client';

/**
 * ListingCardContent - Main content area slot for listing cards
 *
 * Wraps content in the standard white padding container.
 * All card content (title, meta, tags, stats) goes here.
 *
 * @param {React.ReactNode} children - Content to display
 * @param {string} className - Additional classes
 */
export function ListingCardContent({ children, className = '' }) {
  return <div className={`bg-white p-4 space-y-2 ${className}`}>{children}</div>;
}

/**
 * ListingCardTitle - Title section with optional actions
 *
 * @param {React.ReactNode} children - Title content
 * @param {React.ReactNode} actions - Action buttons (dropdown, etc.)
 * @param {string} className - Additional classes
 */
export function ListingCardTitle({ children, actions = null, className = '' }) {
  return (
    <div className={`flex justify-between items-start ${className}`}>
      <h2 className="m-0">{children}</h2>
      {actions}
    </div>
  );
}

/**
 * ListingCardMeta - Metadata item with icon
 *
 * @param {React.Component} icon - Lucide icon component
 * @param {React.ReactNode} children - Meta text content
 * @param {string} className - Additional classes
 */
export function ListingCardMeta({ icon: Icon, children, className = '' }) {
  return (
    <span className={`text-gray-500 text-sm flex items-center gap-2 ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </span>
  );
}

/**
 * ListingCardTags - Tags/badges container
 *
 * @param {React.ReactNode} children - Tag badges
 * @param {string} className - Additional classes
 */
export function ListingCardTags({ children, className = '' }) {
  return <div className={`flex gap-2 flex-wrap ${className}`}>{children}</div>;
}

/**
 * ListingCardStats - Stats row (rating, bookings, etc.)
 *
 * @param {React.ReactNode} children - Stat items
 * @param {string} className - Additional classes
 */
export function ListingCardStats({ children, className = '' }) {
  return <div className={`flex justify-start gap-2 ${className}`}>{children}</div>;
}
