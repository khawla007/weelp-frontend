'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, CircleCheckBig, Clock, MapPin, Minus, Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

const WAITING_STEP_MINUTES = 5;

export default function TransferResultCard({ transfer, onSelect, pickupAt, passengers }) {
  const vehicleType = transfer?.vehicle_type ?? transfer?.vendorRoutes?.vehicle_type ?? null;
  const originName = transfer?.origin_name ?? transfer?.route?.origin?.name ?? null;
  const destinationName = transfer?.destination_name ?? transfer?.route?.destination?.name ?? null;
  const routeName = transfer?.route_name ?? transfer?.route?.name ?? null;
  const routeTitle = routeName ?? (originName && destinationName ? `${originName} → ${destinationName}` : (transfer?.name ?? 'Transfer'));
  const featuredImage = transfer?.featured_image || transfer?.media?.[0]?.url || '/assets/images/Car.png';

  const currency = transfer?.route_currency ?? transfer?.currency ?? 'USD';
  const unitPrice = Number(transfer?.route_price ?? 0);
  const priceType = transfer?.price_type ?? transfer?.pricingAvailability?.price_type ?? 'per_vehicle';
  const headcount = Math.max(1, Number(passengers?.adults ?? 1) + Number(passengers?.children ?? 0));
  const isPerPerson = priceType === 'per_person';
  const basePrice = isPerPerson ? Math.round(unitPrice * headcount * 100) / 100 : unitPrice;
  const luggageRate = Number(transfer?.luggage_per_bag_rate ?? 0);
  const waitingRate = Number(transfer?.waiting_per_minute_rate ?? 0);

  const durationHours = Math.round(((transfer?.route_duration_minutes ?? 0) / 60) * 10) / 10;

  const [expanded, setExpanded] = useState(true);
  const [bagCount, setBagCount] = useState(0);
  const [waitingMinutes, setWaitingMinutes] = useState(0);

  const luggageAmount = Math.round(luggageRate * bagCount * 100) / 100;
  const waitingAmount = Math.round(waitingRate * waitingMinutes * 100) / 100;
  const lineTotal = Math.round((basePrice + luggageAmount + waitingAmount) * 100) / 100;
  const hasExtras = bagCount > 0 || waitingMinutes > 0;

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

  const handleSelectClick = () => {
    onSelect?.(transfer, {
      bag_count: bagCount,
      waiting_minutes: waitingMinutes,
      luggage_per_bag_rate: luggageRate,
      waiting_per_minute_rate: waitingRate,
      luggage_amount: luggageAmount,
      waiting_amount: waitingAmount,
      base_price: basePrice,
      unit_price: unitPrice,
      price_type: priceType,
      headcount,
      line_total: lineTotal,
    });
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

        <div style={{ backgroundImage: `url('${featuredImage}')` }} className="flex-[3] h-40 bg-cover bg-left" role="img" aria-label={routeTitle} />
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

      {expanded && (
        <div className="py-4 px-8 border-t border-b border-[#eaeaea] flex flex-col gap-4 bg-[#fafbfb]">
          <ExtraRow
            label="Extra luggage"
            sublabel={luggageRate > 0 ? `${formatCurrency(luggageRate, currency)} per bag` : 'Not available'}
            value={bagCount}
            onChange={setBagCount}
            disabled={luggageRate <= 0}
            min={0}
            step={1}
            amount={luggageAmount}
            currency={currency}
          />
          <ExtraRow
            label="Waiting time"
            sublabel={waitingRate > 0 ? `${formatCurrency(waitingRate, currency)} per minute` : 'Not available'}
            value={waitingMinutes}
            onChange={setWaitingMinutes}
            disabled={waitingRate <= 0}
            min={0}
            step={WAITING_STEP_MINUTES}
            amount={waitingAmount}
            currency={currency}
            unit="min"
          />
        </div>
      )}

      <div className="py-4 px-8 flex justify-between items-center gap-4">
        <div className="flex flex-col">
          {hasExtras ? (
            <>
              <span className="text-[#5a5a5a] text-xs">Base {formatCurrency(basePrice, currency)}</span>
              <span className="text-[#273f4e] font-semibold text-lg">{formatCurrency(lineTotal, currency)}</span>
            </>
          ) : (
            <span className="text-[#273f4e] font-semibold text-lg">{formatCurrency(basePrice, currency)}</span>
          )}
          {isPerPerson && (
            <span className="text-[#5a5a5a] text-xs">{formatCurrency(unitPrice, currency)} × {headcount} pax</span>
          )}
          <button type="button" onClick={() => setExpanded((v) => !v)} className="text-[#5a5a5a] text-xs flex items-center gap-1 hover:text-[#273f4e] transition-colors mt-1" aria-expanded={expanded}>
            <span>Detailed Breakdown</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <Button type="button" onClick={handleSelectClick} className="bg-[#57947d] hover:bg-[#57947d]/90 text-white px-10">
          Select
        </Button>
      </div>
    </Card>
  );
}

function ExtraRow({ label, sublabel, value, onChange, disabled, min, step, amount, currency, unit }) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(value + step);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-[#273f4e] text-sm font-medium">{label}</span>
        <span className="text-[#5a5a5a] text-xs">{sublabel}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[#273f4e] text-sm font-medium min-w-[5rem] text-right">+ {formatCurrency(amount, currency)}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || value <= min}
            className="h-7 w-7 rounded-full border border-[#cccccc] flex items-center justify-center text-[#273f4e] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f3f5f5]"
            aria-label={`Decrease ${label}`}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-[#273f4e] text-sm font-medium min-w-[2.5rem] text-center">
            {value}
            {unit ? ` ${unit}` : ''}
          </span>
          <button
            type="button"
            onClick={increment}
            disabled={disabled}
            className="h-7 w-7 rounded-full border border-[#cccccc] flex items-center justify-center text-[#273f4e] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f3f5f5]"
            aria-label={`Increase ${label}`}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
