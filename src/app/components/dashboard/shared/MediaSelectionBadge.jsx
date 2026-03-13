'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MediaSelectionBadge - A reusable badge component for media selection
 *
 * States:
 * - Unselected: White background with #568f7c border (visible affordance)
 * - Selected: #568f7c background with white checkmark
 *
 * Used across: Countries, States, Cities, Places, Activities, Itineraries,
 * Packages, Blogs, Transfers
 */
export function MediaSelectionBadge({ isSelected, className }) {
  return (
    <div
      className={cn(
        'absolute top-2 left-2 w-6 h-6 rounded-full p-1 shadow-md transition-all flex items-center justify-center',
        // Unselected state: white bg with green border (visible affordance)
        !isSelected && 'bg-white border-2 border-[#568f7c]',
        // Selected state: green bg with white checkmark
        isSelected && 'bg-[#568f7c]',
        className
      )}
    >
      {isSelected && <Check size={16} strokeWidth={3} className="text-white" />}
    </div>
  );
}
