'use client';

import { Badge } from '@/components/ui/badge';
import { getStatusVariant, formatStatusLabel, STATUS_TYPES } from './constants/statusConfig';

export function StatusBadge({
  status,
  type = STATUS_TYPES.CATEGORY,
  className = '',
}) {
  if (!status) return null;

  const variant = getStatusVariant(status, type);
  const label = formatStatusLabel(status);

  return (
    <div className="capitalize">
      <Badge
        variant={variant}
        className={`min-w-[85px] justify-center ${className}`}
      >
        {label}
      </Badge>
    </div>
  );
}
