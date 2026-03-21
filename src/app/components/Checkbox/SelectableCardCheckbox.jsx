'use client';

import { Checkbox } from '@/components/ui/checkbox';

/**
 * SelectableCardCheckbox - Reusable checkbox for card selection in list views
 *
 * @param {Object} props
 * @param {boolean} props.checked - Is this item currently selected?
 * @param {Function} props.onCheckedChange - Callback when checkbox state changes: (checked: boolean, itemId: string|number) => void
 * @param {string|number} props.itemId - Unique identifier for the item
 * @param {boolean} [props.disabled=false] - Optional: disable the checkbox
 */
export const SelectableCardCheckbox = ({ checked, onCheckedChange, itemId, disabled = false }) => {
  return (
    <Checkbox
      checked={checked}
      disabled={disabled}
      className="h-5 w-5 rounded border-2 border-[#568f7c] bg-white data-[state=checked]:bg-[#568f7c] data-[state=checked]:text-white data-[state=checked]:border-[#568f7c] [&_svg]:text-white [&_svg]:scale-100 transition-none transform-none"
      onCheckedChange={(checked) => onCheckedChange(checked, itemId)}
    />
  );
};
