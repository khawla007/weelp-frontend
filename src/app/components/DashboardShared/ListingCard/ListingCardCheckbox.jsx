'use client';

import { SelectableCardCheckbox } from '@/app/components/Checkbox/SelectableCardCheckbox';

/**
 * ListingCardCheckbox - Checkbox slot for bulk selection
 *
 * Positioned absolutely in top-left corner for consistency.
 *
 * @param {boolean} checked - Whether the checkbox is checked
 * @param {function} onCheckedChange - Change handler (checked, id) => void
 * @param {string|number} itemId - Unique identifier for the item
 * @param {string} className - Additional classes
 */
export function ListingCardCheckbox({ checked, onCheckedChange, itemId, className = '' }) {
  return (
    <div className={`absolute top-4 left-4 w-fit z-20 ${className}`}>
      <SelectableCardCheckbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        itemId={itemId}
      />
    </div>
  );
}
