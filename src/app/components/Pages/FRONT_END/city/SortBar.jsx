'use client';

import { ChevronDown, MapPin } from 'lucide-react';

export default function SortBar({ onSortChange }) {
  return (
    <div className="flex items-center gap-3">
      <button
        className="flex items-center gap-2 rounded-[7.86px] border px-4 py-2 text-[#435a67] transition hover:bg-gray-50"
        style={{
          borderColor: 'rgba(67, 90, 103, 0.26)',
          fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
          fontWeight: 500,
          fontSize: '16px',
        }}
        onClick={onSortChange}
      >
        Sort
        <ChevronDown className="size-4" />
      </button>
      <button
        className="flex items-center gap-2 rounded-[7.86px] border px-4 py-2 text-[#435a67] transition hover:bg-gray-50"
        style={{
          borderColor: 'rgba(67, 90, 103, 0.26)',
          fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
          fontWeight: 500,
          fontSize: '16px',
        }}
      >
        <MapPin className="size-5" strokeWidth={1.2} />
        View on Map
      </button>
    </div>
  );
}
