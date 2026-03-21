/**
 * Weelp Design System - Typography Tokens
 * Unified type scale for consistent text hierarchy
 */

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter_Tight', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  },

  // Type scale with line heights
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px - Captions, labels
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px - Secondary text
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px - Body text
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px - Emphasized
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px - H4
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px - H3
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - H2
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px - H1
    '5xl': ['3rem', { lineHeight: '1' }], // 48px - Display
  },

  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

export default typography;
