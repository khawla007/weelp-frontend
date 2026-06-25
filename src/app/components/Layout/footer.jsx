'use client';
import { useIsClient } from '@/hooks/useIsClient';
import Link from 'next/link';
import { FOOTER_COLUMNS, FOOTER_LEGAL_ITEMS } from './shellContent';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

const Footer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;

  return (
    <footer>
      {/* ── Main Footer ── */}
      <div className="w-full bg-background pt-[84px]">
        <div className="w-full px-4 lg:px-[60px]">
          {/* Columns + watermark behind */}
          <div className="relative overflow-hidden">
            {/* Watermark behind columns — bottom-left */}
            <p
              aria-hidden="true"
              role="presentation"
              className="absolute bottom-0 left-0 select-none pointer-events-none text-[56px] sm:text-[96px] md:text-[140px] lg:text-[180px] xl:text-[217px] leading-none text-foreground"
              style={{ fontFamily: fontIT, fontWeight: 700, opacity: 0.04 }}
            >
              Weelp.
            </p>

            <div className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4 md:gap-8 lg:grid-cols-5">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title} className="space-y-4">
                  <h3 className="text-[15px] md:text-[16px] lg:text-[18px] text-foreground" style={{ fontFamily: fontIT, fontWeight: 700, letterSpacing: '-0.38px' }}>
                    {column.title}
                  </h3>
                  <div className="space-y-3">
                    {column.links.map((link) => (
                      <div key={link.label} className="flex items-center gap-2">
                        {link.href ? (
                          <Link
                            href={link.href}
                            className="group/nav relative inline-flex text-[14px] md:text-[15px] lg:text-[18px] text-foreground cursor-pointer transition-[color] duration-200 ease-out motion-reduce:transition-none hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm"
                            style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px' }}
                          >
                            {link.label}
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -bottom-2 left-0 h-px w-full origin-left rounded-full bg-weelp-sage-deep scale-x-0 opacity-0 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none group-hover/nav:scale-x-100 group-hover/nav:opacity-100"
                            />
                          </Link>
                        ) : (
                          <span
                            className="text-[14px] md:text-[15px] lg:text-[18px] text-foreground cursor-pointer transition-colors duration-200 ease-out hover:text-foreground/70"
                            style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px' }}
                          >
                            {link.label}
                          </span>
                        )}
                        {link.label === 'Career' && (
                          <span
                            className="rounded-[9px] border-2 border-weelp-sage-deep/10 px-2 py-0.5 text-[11px] md:px-2.5 md:py-1 md:text-[13px] lg:text-[15px] text-weelp-copy"
                            style={{ fontFamily: fontIT, fontWeight: 600, letterSpacing: '0.17px' }}
                          >
                            We are hiring
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Payment Partners column */}
              <div className="col-span-2 space-y-4 sm:col-span-1">
                <h3 className="text-[15px] md:text-[16px] lg:text-[18px] text-foreground" style={{ fontFamily: fontIT, fontWeight: 700, letterSpacing: '-0.38px' }}>
                  Payment Partners
                </h3>
                <span className="inline-block max-w-[355px] bg-background">
                  <img
                    src="/assets/images/payment-partners.png"
                    alt="Payment Partners - Visa, Mastercard, PayPal, Apple Pay, Google Pay"
                    className="h-auto w-full dark:mix-blend-lighten dark:[filter:invert(1)_hue-rotate(180deg)]"
                  />
                </span>
              </div>
            </div>

            {/* Social icons — bottom right */}
            <div className="relative z-10 mt-6 flex flex-wrap justify-end gap-5 pb-4 sm:gap-6">
              <a
                href="#"
                aria-label="Instagram"
                className="text-foreground hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm transition-colors duration-200 ease-out"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="X / Twitter"
                className="text-foreground hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm transition-colors duration-200 ease-out"
              >
                <svg width="22" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="text-foreground hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm transition-colors duration-200 ease-out"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.16V11.7a4.83 4.83 0 01-3.58-1.43V6.69h3.58z" />
                </svg>
              </a>
            </div>
          </div>
          {/* close relative wrapper */}

          {/* Bottom bar */}
          <div className="pt-[20px] pb-[20px]">
            <div className="mb-[20px] border-t border-border" />
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-[13px] md:text-[15px] lg:text-[18px] text-foreground" style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px' }}>
                &copy; 2024 - Weelp. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {FOOTER_LEGAL_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[13px] md:text-[15px] lg:text-[18px] text-foreground cursor-pointer transition-colors duration-200 ease-out motion-reduce:transition-none hover:text-foreground/70 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm"
                    style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
