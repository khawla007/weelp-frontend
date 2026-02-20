/**
 * Weelp Design System - Main Export
 * Central export for all design tokens
 */

export { colors, legacyMappings } from './colors';
export { typography } from './typography';
export { spacing, spacingPresets } from './spacing';
export { shadows, shadowPresets } from './shadows';

// Design system metadata
export const designSystem = {
  version: '1.0.0',
  name: 'Weelp Design System',
  spacingBase: 8, // 8px grid system
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

const designSystemExport = {
  colors: { colors },
  typography: { typography },
  spacing: { spacing },
  shadows: { shadows },
};

export default designSystemExport;
