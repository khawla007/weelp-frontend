/**
 * Weelp Design System - Color Tokens
 * Unified color palette replacing scattered hex values
 */

export const colors = {
  // Primary brand (teal green) - main brand identity
  brand: {
    50: '#f2f7f5',
    100: '#e6efe9',
    200: '#b5d8cb',
    300: '#8bc2a9',
    400: '#6bae8e',
    500: '#51927a', // Primary brand color
    600: '#427660',
    700: '#345a48',
    800: '#273f30',
    900: '#1a2418',
  },

  // Semantic colors - for status, feedback, messaging
  semantic: {
    success: '#10b981', // Green for success states
    warning: '#f59e0b', // Amber for warnings
    error: '#ef4444', // Red for errors
    info: '#3b82f6', // Blue for informational messages
  },

  // Neutral grays - for text, borders, backgrounds
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Legacy color mappings for migration (old name -> new value)
export const legacyMappings = {
  secondaryDark: colors.brand[600],
  secondarylight: colors.brand[200],
  secondaryLight2: colors.brand[50],
  dangerSecondary: colors.semantic.error,
  dangerLite: '#fef2f2',
  grayDark: colors.gray[700],
  graycolor: colors.gray[400],
  Brightgray: colors.gray[100],
  Nileblue: '#273F4E',
  Bluewhale: colors.gray[600],
  Blueish: '#0c2536',
  Lynchcolor: colors.gray[500],
  solitude: colors.gray[200],
  homebackground: colors.brand[50],
  blackish: colors.gray[700],
  mainBackground: '#F8F9F9',
};

export default colors;
