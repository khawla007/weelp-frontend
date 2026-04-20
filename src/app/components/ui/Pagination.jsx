'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

const BTN_STYLE = {
  borderColor: '#e0e6eb',
  fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
  fontWeight: 400,
  fontSize: '15.6px',
};

function buildPageList(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const left = new Set([1, 2, 3]);
  const right = new Set([totalPages - 2, totalPages - 1, totalPages]);
  const around = new Set([currentPage - 1, currentPage, currentPage + 1].filter((p) => p >= 1 && p <= totalPages));
  const all = [...new Set([...left, ...around, ...right])].sort((a, b) => a - b);

  const pages = [];
  for (let i = 0; i < all.length; i++) {
    if (i > 0 && all[i] - all[i - 1] > 1) pages.push('...');
    pages.push(all[i]);
  }
  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange, align = 'end' }) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages);

  return (
    <div className={`flex gap-1 md:gap-2 justify-center md:justify-end flex-wrap ${align === 'center' ? 'justify-center' : ''}`}>
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex size-10 md:size-[35px] items-center justify-center rounded-[7.68px] border bg-white text-[#4f566b] shadow-[0_1.89px_4.13px_rgba(60,66,87,0.08)] transition disabled:opacity-45"
        style={{ borderColor: '#e0e6eb' }}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="flex size-10 md:size-[35px] items-center justify-center text-[#435a67]" style={BTN_STYLE}>
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`flex size-10 md:size-[35px] items-center justify-center rounded-[7.68px] border text-[#435a67] transition ${
              currentPage === page ? 'bg-white opacity-100 shadow-[0_1.89px_4.13px_rgba(60,66,87,0.08)]' : 'bg-white opacity-45'
            }`}
            style={BTN_STYLE}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex size-10 md:size-[35px] items-center justify-center rounded-[7.68px] border bg-white text-[#4f566b] shadow-[0_1.89px_4.13px_rgba(60,66,87,0.08)] transition disabled:opacity-45"
        style={{ borderColor: '#e0e6eb' }}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
