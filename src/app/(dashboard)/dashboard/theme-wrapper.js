'use client';

import { useUIStore } from '@/lib/store/uiStore';
import { Inter, Roboto, Poppins } from 'next/font/google';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const roboto = Roboto({ subsets: ['latin'], display: 'swap', weight: '400' });
const poppins = Poppins({ subsets: ['latin'], display: 'swap', weight: '400' });

const fontMap = {
  Inter: inter.className,
  Roboto: roboto.className,
  Poppins: poppins.className,
};

export function ThemeWrapper({ children }) {
  const theme = useUIStore((state) => state.theme);
  const font = useUIStore((state) => state.font);

  // Apply theme and font to the HTML element
  useEffect(() => {
    const html = document.documentElement;

    // Clear existing font and theme classes
    html.classList.remove('dark');
    html.className = html.className
      .split(' ')
      .filter((cls) => !cls.startsWith('font-'))
      .join(' ');

    // Apply theme class
    if (theme === 'dark') {
      html.classList.add('dark');
    }

    // Apply font class from store
    const fontClassName = fontMap[font] || fontMap.Inter;
    html.classList.add(...fontClassName.split(' '));
  }, [theme, font]);

  return <>{children}</>;
}
