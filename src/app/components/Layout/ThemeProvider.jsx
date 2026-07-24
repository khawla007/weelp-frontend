'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { DEFAULT_THEME, EXPLICIT_THEMES, THEME_STORAGE_KEY } from './themeConfig';

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme={DEFAULT_THEME} enableSystem={false} disableTransitionOnChange storageKey={THEME_STORAGE_KEY} themes={EXPLICIT_THEMES}>
      {children}
    </NextThemesProvider>
  );
}
