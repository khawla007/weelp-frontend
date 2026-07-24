'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { resolveExplicitTheme, THEME_COLORS } from './themeConfig';

const THEME_COLOR_SELECTOR = 'meta[name="theme-color"]';

export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let meta = document.head.querySelector(THEME_COLOR_SELECTOR);

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.append(meta);
    }

    const theme = resolveExplicitTheme(resolvedTheme);
    meta.content = THEME_COLORS[theme];
  }, [resolvedTheme]);

  return null;
}
