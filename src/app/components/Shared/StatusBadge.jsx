'use client';

import { Badge } from '@/components/ui/badge';
import { getStatusVariant, formatStatusLabel, STATUS_TYPES } from './constants/statusConfig';

export function StatusBadge({ status, type = STATUS_TYPES.CATEGORY, className = '', icon: Icon }) {
  if (!status) return null;

  const variant = getStatusVariant(status, type);
  const label = formatStatusLabel(status);

  return (
    <div className="capitalize">
      <Badge variant={variant} className={`text-xs gap-2 min-w-[100px] justify-center ${className}`}>
        {Icon && <Icon size={16} />}
        {label}
      </Badge>
    </div>
  );
}

export { STATUS_TYPES };
