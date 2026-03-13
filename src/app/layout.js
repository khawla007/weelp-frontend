import { Inter_Tight, Montez } from 'next/font/google';
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

export const metadata = {
  title: 'Weelp - Travel Booking Platform',
  description: 'Discover amazing travel experiences',
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning={true}>
      <body className={`${interTight.variable} ${montez.variable} font-sans antialiased tfc_scroll`}>
        {children}
      </body>
    </html>
  );
}
