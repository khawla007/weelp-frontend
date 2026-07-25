'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { DashboardContentWrapper } from '@/app/components/Pages/DASHBOARD/DashboardContentWrapper';
import Header from '@/app/components/Layout/header';
import Footer from '@/app/components/Layout/footer';
import DashboardSidebar from '@/app/components/Layout/DashboardSidebar';
import { useSession } from 'next-auth/react';
import { DashboardUserNav } from '@/app/Data/userData';
import { PanelLeft } from 'lucide-react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function DashboardMobileBar({ user }) {
  const barRef = useRef(null);
  const firstName = user?.name?.trim()?.split(' ')?.[0] || 'Customer';

  const syncTopOffset = useCallback(() => {
    const header = document.querySelector('[data-weelp-header-variant]');
    const mobileMenu = document.querySelector('[data-weelp-mobile-menu="true"]');

    const candidates = [header, mobileMenu]
      .map((element) => {
        if (!element) return 0;
        const styles = window.getComputedStyle(element);
        if (styles.display === 'none' || styles.visibility === 'hidden') return 0;
        const rect = element.getBoundingClientRect();
        return rect.height > 0 ? rect.bottom : 0;
      })
      .filter((bottom) => bottom > 0);

    const nextTop = Math.max(0, Math.max(...candidates, 0));
    if (barRef.current) {
      barRef.current.style.top = `${nextTop}px`;
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    syncTopOffset();

    let frame = 0;
    let trackingFrame = 0;
    let trackingUntil = 0;

    const scheduleSync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        syncTopOffset();
      });
    };

    const trackHeaderTransition = () => {
      syncTopOffset();

      if (performance.now() < trackingUntil) {
        trackingFrame = window.requestAnimationFrame(trackHeaderTransition);
        return;
      }

      trackingFrame = 0;
    };

    const startHeaderTransitionTracking = () => {
      syncTopOffset();
      trackingUntil = performance.now() + 360;
      if (!trackingFrame) {
        trackingFrame = window.requestAnimationFrame(trackHeaderTransition);
      }
    };

    window.addEventListener('scroll', startHeaderTransitionTracking, { passive: true });
    window.addEventListener('resize', scheduleSync);
    document.querySelector('[data-weelp-mobile-menu="true"]')?.addEventListener('transitionend', scheduleSync);

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleSync);
    const mobileMenu = document.querySelector('[data-weelp-mobile-menu="true"]');
    if (mobileMenu) resizeObserver?.observe(mobileMenu);

    return () => {
      window.removeEventListener('scroll', startHeaderTransitionTracking);
      window.removeEventListener('resize', scheduleSync);
      document.querySelector('[data-weelp-mobile-menu="true"]')?.removeEventListener('transitionend', scheduleSync);
      if (frame) window.cancelAnimationFrame(frame);
      if (trackingFrame) window.cancelAnimationFrame(trackingFrame);
      resizeObserver?.disconnect();
    };
  }, [syncTopOffset]);

  const toggleSidebar = () => {
    const bar = document.querySelector('[data-dashboard-mobile-bar="true"]');
    const offset = Math.round(bar?.getBoundingClientRect().bottom || 48);
    window.dispatchEvent(new CustomEvent('dashboard-sidebar-toggle', { detail: { offset } }));
  };

  return (
    <>
      <div
        ref={barRef}
        data-dashboard-mobile-bar="true"
        className="fixed inset-x-0 z-[95] flex h-12 items-center justify-center border-y border-border bg-card px-4 shadow-sm lg:hidden"
        style={{ top: 114 }}
      >
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="absolute left-4 flex size-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted hover:text-foreground/70"
        >
          <PanelLeft size={20} className="rotate-180" />
        </button>
        <p className="max-w-[calc(100%-6rem)] truncate text-center text-sm font-semibold text-foreground">Welcome {firstName}</p>
      </div>
      <div aria-hidden="true" className="h-12 shrink-0 lg:hidden" />
    </>
  );
}

export default function UserLayout({ children }) {
  const { data: session } = useSession();
  const user = session?.user || {};

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-[96] lg:contents">
        <Header />
      </div>
      <div className="flex flex-1 min-w-0 flex-col bg-muted/40 dark:bg-background">
        <DashboardMobileBar user={user} />
        <div className="flex flex-1 relative min-w-0">
          <DashboardSidebar nav={DashboardUserNav.userRoutes} user={user} />
          <main className="min-w-0 flex-1 w-full overflow-x-hidden bg-background">
            <DashboardContentWrapper>{children}</DashboardContentWrapper>
            <Toaster />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
