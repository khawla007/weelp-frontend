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
      className="absolute -top-3 right-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[4px_4px_12px_rgba(0,0,0,0.1)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:shadow-none sm:-right-3 sm:h-8 sm:w-8"
    >
      <X size={16} />
    </button>
  ) : null;

  if (loading) {
    return (
      <div className="relative">
        {CloseButton}
        <div data-testid="transfer-results-loading" className="flex max-h-[min(65dvh,520px)] flex-col gap-3 overflow-y-auto rounded-xl bg-background p-3 shadow-xl dark:shadow-none sm:gap-4 sm:p-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex-[3] space-y-3">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-4 w-40 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
                <div className="h-28 w-full flex-[3] rounded bg-muted sm:h-32" />
              </div>
              <div className="h-8 mt-4 bg-muted rounded" />
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
        <div data-testid="transfer-results-empty" className="rounded-xl bg-background px-4 py-8 text-center text-muted-foreground shadow-xl dark:shadow-none sm:p-8">
          No transfers found for this route. Try different locations.
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {CloseButton}
      <div data-testid="transfer-results-list" className="flex max-h-[min(65dvh,520px)] flex-col gap-3 overflow-y-auto rounded-xl bg-background p-2 shadow-xl dark:shadow-none sm:gap-4 sm:p-4">
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
