'use client';
import React from 'react';
import { useIsClient } from '@/hooks/useIsClient';
import Link from 'next/link';
import { FOOTER_COLUMNS, FOOTER_EXPLORE_TAGS, FOOTER_LEGAL_ITEMS } from './shellContent';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

const Footer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;

  return (
    <footer>
      {/* ── Weelp Recommendations ── */}
      <div className="w-full bg-[#f3f5f6]">
        <div className="w-full px-[60px] py-10">
          <h3 className="text-[18px] text-[#243141] mb-2" style={{ fontFamily: fontIT, fontWeight: 600, letterSpacing: '-0.38px' }}>
            Weelp Recommendations
          </h3>
          <div className="mb-6" style={{ borderTop: '1.3px solid #e3e3e3a6' }} />
          <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {FOOTER_EXPLORE_TAGS.map((tag, i) => (
              <Link
                key={`${tag.label}-${i}`}
                href={tag.href}
                className="text-[16px] text-[#6f7680] transition hover:text-[#243141]"
                style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px', lineHeight: 2.06 }}
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer ── */}
      <div className="w-full bg-white">
        <div className="w-full px-[60px] pt-[71px]">
          {/* Columns + watermark behind */}
          <div className="relative">
            {/* Watermark behind columns — bottom-left */}
            <p
              className="absolute bottom-0 left-0 select-none pointer-events-none text-[120px] md:text-[217px] leading-none text-[#142a38]"
              style={{ fontFamily: fontIT, fontWeight: 700, opacity: 0.04 }}
            >
              Weelp.
            </p>

            <div className="relative z-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title} className="space-y-4">
                  <h3 className="text-[18px] text-[#243141]" style={{ fontFamily: fontIT, fontWeight: 600, letterSpacing: '-0.38px' }}>
                    {column.title}
                  </h3>
                  <div className="space-y-3">
                    {column.links.map((link) => (
                      <div key={link.label} className="flex items-center gap-2">
                        {link.href ? (
                          <Link href={link.href} className="text-[18px] text-[#6f7680] transition hover:text-[#243141]" style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px' }}>
                            {link.label}
                          </Link>
                        ) : (
                          <span className="text-[18px] text-[#6f7680]" style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px' }}>
                            {link.label}
                          </span>
                        )}
                        {link.label === 'Career' && (
                          <span className="rounded-[9px] border-2 border-[#759c8d1a] px-2.5 py-1 text-[15px] text-[#759c8d]" style={{ fontFamily: fontIT, fontWeight: 600, letterSpacing: '0.17px' }}>
                            We are hiring
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Payment Partners column */}
              <div className="space-y-4">
                <h3 className="text-[18px] text-[#243141]" style={{ fontFamily: fontIT, fontWeight: 600, letterSpacing: '-0.38px' }}>
                  Payment Partners
                </h3>
                <img src="/assets/images/payment-partners.png" alt="Payment Partners - Visa, Mastercard, PayPal, Apple Pay, Google Pay" className="w-full max-w-[355px] h-auto" />
              </div>
            </div>

            {/* Social icons — bottom right */}
            <div className="relative z-10 mt-6 flex justify-end gap-6 pb-4">
              <a href="#" aria-label="Instagram" className="text-[#8f8f8f] hover:text-[#243141] transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="X / Twitter" className="text-[#8f8f8f] hover:text-[#243141] transition">
                <svg width="22" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="TikTok" className="text-[#8f8f8f] hover:text-[#243141] transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.16V11.7a4.83 4.83 0 01-3.58-1.43V6.69h3.58z" />
                </svg>
              </a>
            </div>
          </div>
          {/* close relative wrapper */}

          {/* Bottom bar */}
          <div className="pt-[50px] pb-[50px]">
            <div className="mb-[50px]" style={{ borderTop: '1.3px solid #e3e3e3a6' }} />
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-[18px] text-[#6f7680]" style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px' }}>
                &copy; 2024 - Weelp. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                {FOOTER_LEGAL_ITEMS.map((item) => (
                  <span key={item} className="text-[18px] text-[#6f7680] cursor-pointer transition hover:text-[#243141]" style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px' }}>
                    {item}
                  </span>
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
