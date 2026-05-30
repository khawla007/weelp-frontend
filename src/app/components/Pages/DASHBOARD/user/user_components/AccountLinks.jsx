'use client';
import { useEffect, useRef, useState } from 'react';
import { NavigationMenu, NavigationMenuList, NavigationMenuLink, NavigationMenuItem } from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// NOTE: this nav intentionally keeps raw next/link `Link` rather than the
// project's NavigationLink. Radix `NavigationMenuLink asChild` requires a single
// anchor child to wire keyboard/roving-focus semantics; NavigationLink renders
// its own wrapper and would break that contract. Pre-existing exception.
export function AccountLinks({ AccountRoutes }) {
  const pathname = usePathname();
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  // `ready` gates the slide transition: the FIRST positioning must not animate
  // from translateY(0); we apply `.weelp-settings-rail` only once measured.
  const [indicator, setIndicator] = useState({ top: 0, height: 0, ready: false });

  const activeIndex = AccountRoutes?.findIndex((r) => pathname === r.url || pathname?.startsWith(`${r.url}/`)) ?? -1;

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const el = itemRefs.current[activeIndex];
      if (!container || !el) {
        setIndicator((prev) => ({ ...prev, ready: false }));
        return;
      }
      // Rect deltas are independent of offsetParent identity — robust against
      // any positioned wrapper Radix injects between the <li> and our container.
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicator({ top: elRect.top - containerRect.top, height: elRect.height, ready: true });
    };
    measure();
    // Re-measure on resize (uneven item heights can reflow responsively).
    // ResizeObserver is guarded for jsdom/older-browser safety.
    if (typeof ResizeObserver === 'undefined' || !containerRef.current) return;
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [activeIndex, pathname]);

  return (
    <NavigationMenu className="w-full">
      <div ref={containerRef} className="relative w-full">
        {/* Sliding active indicator (transform only — no layout shift). */}
        <span
          aria-hidden="true"
          className={`absolute left-0 w-0.5 rounded-full bg-[#588f7a] ${indicator.ready ? 'weelp-settings-rail' : ''}`}
          style={{
            transform: `translateY(${indicator.top}px)`,
            height: `${indicator.height}px`,
            opacity: indicator.ready ? 1 : 0,
          }}
        />
        <NavigationMenuList className={'flex flex-col space-y-2'}>
          {AccountRoutes?.map((val, index) => {
            const isActive = index === activeIndex;
            return (
              <NavigationMenuItem
                key={index}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className={`w-full py-2 rounded-md font-medium transition-colors ${
                  isActive ? 'bg-gray-100 text-black' : 'text-[#52525b] hover:bg-gray-100 hover:text-black'
                }`}
              >
                <NavigationMenuLink asChild className="w-full px-4">
                  <Link className="inline-block w-full" href={val?.url} aria-current={isActive ? 'page' : undefined}>
                    {val?.title}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
}
