'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '../components/Layout/header';
import Footer from '../components/Layout/footer';
import { useIsClient } from '@/hooks/useIsClient';
import AppProviders from '../components/Layout/ProviderWrapper';
import { useUIStore } from '@/lib/store/uiStore';
import { PageLoader } from '../components/Loading/PageLoader';

export default function FrontendLayout({ children }) {
  const isClient = useIsClient(); // hydration
  const { stickyHeader, pageLoading, setPageLoading } = useUIStore();
  const pathname = usePathname();

  // Handle route changes
  useEffect(() => {
    // If not already loading (from a click), start it for route changes
    if (!pageLoading) {
      setPageLoading(true);
    }

    // Secondary scroll ensure on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname, setPageLoading]);

  // Handle immediate click loading
  useEffect(() => {
    const handleLinkClick = (e) => {
      const target = e.target.closest('a');
      if (
        target &&
        target.href &&
        target.href.startsWith(window.location.origin) &&
        !target.href.includes('#') &&
        target.target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // Only trigger if the target URL is different from current or it's a known internal navigation
        const currentUrl = window.location.href.split('#')[0];
        const targetUrl = target.href.split('#')[0];

        if (currentUrl !== targetUrl) {
          setPageLoading(true);
          // Immediate smooth scroll on click
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [setPageLoading]);

  if (!isClient) return null;

  return (
    <AppProviders>
      <Header />
      <main className={`bg-mainBackground ${stickyHeader ? 'pt-16' : ''} min-h-[90vh]`}>
        {pageLoading ? <PageLoader /> : children}
      </main>
      <Footer />
    </AppProviders>
  );
}
