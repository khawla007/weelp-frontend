import { Inter, Inter_Tight, Montez, Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '600', '500', '700'],
  variable: '--font-interTight',
  style: 'normal',
});

const montez = Montez({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-montez',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
});

export const metadata = {
  title: 'Weelp - Travel Booking Platform',
  description: 'Discover amazing travel experiences',
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning={true}>
      <body className={`${interTight.variable} ${inter.variable} ${plusJakartaSans.variable} ${outfit.variable} ${montez.variable} font-sans antialiased tfc_scroll`}>{children}</body>
    </html>
  );
}
