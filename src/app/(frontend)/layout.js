'use client';
import { Inter_Tight } from 'next/font/google';
import Header from '../components/Layout/header';
import Footer from '../components/Layout/footer';
import { useIsClient } from '@/hooks/useIsClient';
import AppProviders from '../components/Layout/ProviderWrapper';
import { useUIStore } from '@/lib/store/uiStore';
import '../globals.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '600', '500', '700'],
  style: 'normal',
});

export default function RootLayout({ children }) {
  const isClient = useIsClient(); // hydration
  const { stickyHeader } = useUIStore(); // sticky header

  return (
    <html>
      <body className={`${interTight.className} antialiased tfc_scroll`} suppressHydrationWarning={true} suppressContentEditableWarning={true}>
        <AppProviders>
          <Header />
          <main className={`bg-mainBackground ${stickyHeader ? 'pt-16' : ''}`}>{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
