import { Cormorant_Garamond, Inter, Inter_Tight, Montez, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeBootstrap } from './components/Layout/ThemeBootstrap';
import { ThemeColorMeta } from './components/Layout/ThemeColorMeta';
import { ThemeProvider } from './components/Layout/ThemeProvider';
import { THEME_COLORS } from './components/Layout/themeConfig';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '600', '500', '700'],
  variable: '--font-interTight',
  style: 'normal',
  display: 'swap',
});

const montez = Montez({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-montez',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500'],
  style: ['italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Weelp - Travel Booking Platform',
  description: 'Discover amazing travel experiences',
};

export const viewport = {
  colorScheme: 'dark light',
  themeColor: THEME_COLORS.dark,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${interTight.variable} ${inter.variable} ${outfit.variable} ${montez.variable} ${cormorant.variable} font-sans antialiased tfc_scroll`}>
        <ThemeBootstrap />
        <ThemeProvider>
          <ThemeColorMeta />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
