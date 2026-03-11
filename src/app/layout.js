import { Inter_Tight } from 'next/font/google';
import './globals.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '600', '500', '700'],
  style: 'normal',
});

export const metadata = {
  title: 'Weelp - Travel Booking Platform',
  description: 'Discover amazing travel experiences',
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning={true}>
      <body className={`${interTight.className} antialiased tfc_scroll`}>
        {children}
      </body>
    </html>
  );
}
