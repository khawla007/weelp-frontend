'use client';

import { X } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';
import TransferResultCard from './TransferResultCard';

/**
 * Results dropdown panel rendered below the search form after the user
 * submits the TransferSearchForm. Matches pen Frame 1707479777.
 *
 * Props:
 *  - open: boolean — whether the dropdown is visible
 *  - loading: boolean — true while the /api/transfers request is in-flight
 *  - transfers: Array — results from the API
 *  - onSelect: callback(transfer) fired when the user clicks Select on a card
 *  - onClose: callback fired when the user clicks the close (X) button
 *  - pickupAt: Date | string (optional) — pickup datetime, passed to each card
 */
export default function TransferResultsDropdown({ open, loading, transfers = [], onSelect, onClose, pickupAt, passengers }) {
  if (!open) return null;

  const CloseButton = onClose ? (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close results"
      className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white border border-[#e4e4e7] shadow-[4px_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#18181b] hover:bg-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <X size={16} />
    </button>
  ) : null;

  if (loading) {
    return (
      <div className="relative">
        {CloseButton}
        <div className="bg-white rounded-xl shadow-xl p-4 max-h-[520px] overflow-y-auto flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#e4e4e7] rounded-lg p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="flex-[3] space-y-3">
                  <div className="h-3 w-24 bg-[#f4f4f5] rounded" />
                  <div className="h-4 w-40 bg-[#f4f4f5] rounded" />
                  <div className="h-3 w-32 bg-[#f4f4f5] rounded" />
                </div>
                <div className="flex-[3] h-32 bg-[#f4f4f5] rounded" />
              </div>
              <div className="h-8 mt-4 bg-[#f4f4f5] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!Array.isArray(transfers) || transfers.length === 0) {
    return (
      <div className="relative">
        {CloseButton}
        <div className="bg-white rounded-xl shadow-xl p-8 text-center text-[#71717a]">No transfers found for this route. Try different locations.</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {CloseButton}
      <div className="bg-white rounded-xl shadow-xl max-h-[520px] overflow-y-auto flex flex-col gap-4 p-4">
        {transfers.map((transfer, idx) => (
          /* 60ms stagger, capped at 6 cards (~360ms) so later results aren't slow */
          <Reveal key={transfer.id ?? transfer.transfer_id ?? `transfer-${idx}`} delay={Math.min(idx, 6) * 60} duration={400}>
            <TransferResultCard transfer={transfer} onSelect={onSelect} pickupAt={pickupAt} passengers={passengers} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
