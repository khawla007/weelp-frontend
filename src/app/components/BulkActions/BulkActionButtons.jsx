'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

/**
 * BulkActionButtons - Reusable component for bulk selection actions
 *
 * @param {number} selectedCount - Number of selected items
 * @param {number} totalCount - Total items on current page
 * @param {boolean} isAllSelected - Whether all items are selected
 * @param {() => void} onSelectAllToggle - Callback for select/unselect all
 * @param {() => void} onDelete - Callback for delete action
 * @param {string} deleteLabel - Label for delete button (default: 'Delete')
 */
export function BulkActionButtons({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAllToggle,
  onDelete,
  deleteLabel = 'Delete',
}) {
  // Don't render if nothing is selected
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {/* Select All / Unselect All Button */}
      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onSelectAllToggle();
        }}
        variant="outline"
        className="shrink-0 whitespace-nowrap bg-secondaryDark text-black hover:bg-secondaryDark/90"
      >
        {isAllSelected ? 'Unselect All' : `Select All (${totalCount})`}
      </Button>

      {/* Delete Button */}
      <Button
        type="button"
        variant="destructive"
        onClick={(e) => {
          e.preventDefault();
          onDelete();
        }}
        className="shrink-0 whitespace-nowrap"
      >
        <Trash2 size={16} className="mr-2" />
        {deleteLabel} ({selectedCount})
      </Button>
    </div>
  );
}
