'use client';

import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, LucideBox, LucideMap, LucideRoute } from 'lucide-react';

// Addon type configurations
export const ADDON_TYPES = {
  ITINERARY: 'itinerary',
  ACTIVITY: 'activity',
  TRANSFER: 'transfer',
  PACKAGE: 'package',
};

// Icon mapping for each addon type
export const TYPE_ICONS = {
  [ADDON_TYPES.ITINERARY]: LucideRoute,
  [ADDON_TYPES.ACTIVITY]: LucideMap,
  [ADDON_TYPES.TRANSFER]: ArrowRightLeft,
  [ADDON_TYPES.PACKAGE]: LucideBox,
};

// Variant mapping for each addon type
export const TYPE_VARIANTS = {
  [ADDON_TYPES.ITINERARY]: 'success',
  [ADDON_TYPES.ACTIVITY]: 'warning',
  [ADDON_TYPES.TRANSFER]: 'outline',
  [ADDON_TYPES.PACKAGE]: 'destructive',
};

export function TypeBadge({ type, className = '' }) {
  if (!type) return null;

  const typeLower = type.toLowerCase();
  const Icon = TYPE_ICONS[typeLower];
  const variant = TYPE_VARIANTS[typeLower] || 'default';

  return (
    <div className="capitalize">
      <Badge variant={variant} className={`text-xs gap-2 ${className}`}>
        {Icon && <Icon size={16} />}
        {typeLower}
      </Badge>
    </div>
  );
}
