'use client';

import { useUIStore } from '@/lib/store/uiStore';
import { Inter, Roboto } from 'next/font/google';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const roboto = Roboto({ subsets: ['latin'], display: 'swap', weight: '400' });

const fontMap = {
  Inter: inter.className,
  Roboto: roboto.className,
};

export function FontWrapper({ children }) {
  const font = useUIStore((state) => state.font);

  useEffect(() => {
    const html = document.documentElement;
    html.className = html.className
      .split(' ')
      .filter((cls) => !cls.startsWith('font-'))
      .join(' ');
    const fontClassName = fontMap[font] || fontMap.Inter;
    html.classList.add(...fontClassName.split(' '));
  }, [font]);

  return <>{children}</>;
}
