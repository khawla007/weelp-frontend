'use client';

import { Calendar, CircleCheckBig, Clock, MapPin, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Single transfer result card used inside TransferResultsDropdown.
 * Matches pen design Frame 1707479560.
 *
 * Props:
 *  - transfer: transfer object from /api/transfers response
 *  - pickupAt: Date | string (optional) — pickup datetime selected by user
 *  - onSelect: callback(transfer) fired when user clicks Select
 */
export default function TransferResultCard({ transfer, onSelect, pickupAt }) {
  const vehicleType =
    transfer?.vehicle_type
    ?? transfer?.vendorRoutes?.vehicle_type
    ?? null;
  const originName = transfer?.origin_name ?? transfer?.route?.origin?.name ?? null;
  const destinationName = transfer?.destination_name ?? transfer?.route?.destination?.name ?? null;
  const routeName = transfer?.route_name ?? transfer?.route?.name ?? null;
  const routeTitle = routeName
    ?? (originName && destinationName ? `${originName} → ${destinationName}` : (transfer?.name ?? 'Transfer'));
  const featuredImage = transfer?.featured_image || transfer?.media?.[0]?.url || '/assets/images/Car.png';
  const price = Number(transfer?.route_price ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const durationHours = Math.round(((transfer?.route_duration_minutes ?? 0) / 60) * 10) / 10;

  const formatPickup = () => {
    if (!pickupAt) return 'Select date';
    try {
      const d = pickupAt instanceof Date ? pickupAt : new Date(pickupAt);
      if (Number.isNaN(d.getTime())) return 'Select date';
      return d.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Select date';
    }
  };

  return (
    <Card className="p-0 overflow-hidden border border-[#cccccc80] shadow-[0_3.39px_8.89px_#0000000a]">
      <div className="flex flex-row items-stretch">
        <div className="flex-[3] flex flex-col gap-2 py-4 px-8">
          <span className="text-xs text-[#5a5a5a] font-medium">Private Transfer</span>
          <p className="flex items-center gap-2 text-[#273f4e] font-semibold">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{routeTitle}</span>
          </p>
          {vehicleType && (
            <p className="flex items-center gap-2 text-[#5a5a5a] text-sm">
              <Truck className="h-4 w-4 shrink-0" />
              <span className="truncate capitalize">{vehicleType}</span>
            </p>
          )}
          <p className="flex items-center gap-2 text-[#5a5a5a] text-sm">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formatPickup()}</span>
          </p>
        </div>

        <div
          style={{ backgroundImage: `url('${featuredImage}')` }}
          className="flex-[3] h-40 bg-cover bg-left"
          role="img"
          aria-label={routeTitle}
        />
      </div>

      <div className="bg-[#f3f5f5] py-4 px-8 flex flex-wrap gap-2 sm:gap-4">
        <span className="flex items-center gap-2 text-sm text-[#273f4e]">
          <CircleCheckBig className="h-4 w-4 text-[#57947d]" />
          <span>Live Guide</span>
        </span>
        <span className="flex items-center gap-2 text-sm text-[#273f4e]">
          <Clock className="h-4 w-4 text-[#57947d]" />
          <span>Duration - {durationHours} Hours</span>
        </span>
      </div>

      <div className="py-4 px-8 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[#273f4e] font-semibold text-lg">${price}</span>
          <span className="text-[#5a5a5a] text-xs">Detailed Breakdown</span>
        </div>
        <Button
          type="button"
          onClick={() => onSelect?.(transfer)}
          className="bg-[#57947d] hover:bg-[#57947d]/90 text-white px-10"
        >
          Select
        </Button>
      </div>
    </Card>
  );
}
