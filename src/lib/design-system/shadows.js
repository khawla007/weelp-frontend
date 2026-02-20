/**
 * Weelp Design System - Shadow/Elevation Tokens
 * Consistent elevation levels for depth perception
 */

export const shadows = {
  // Elevation levels
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',      // Subtle - Cards, badges
  DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1)',  // Base - Buttons, inputs
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',       // Medium - Dropdowns, cards
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',     // High - Modals, popovers
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',    // Highest - Overlays, tooltips

  // Special shadows
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)', // Inset shadow
  none: 'none', // No shadow
};

// Shadow usage presets
export const shadowPresets = {
  card: 'sm',
  cardHover: 'md',
  button: 'DEFAULT',
  dropdown: 'md',
  modal: 'lg',
  tooltip: 'lg',
  overlay: 'xl',
};

export default shadows;
