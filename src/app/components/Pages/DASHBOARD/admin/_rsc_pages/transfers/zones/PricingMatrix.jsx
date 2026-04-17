'use client';

import { useRef, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { authFetcher } from '@/lib/fetchers';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { upsertTransferZonePrice } from '@/lib/actions/transferZonePrice';

function priceKey(fromId, toId) {
  return `${fromId}:${toId}`;
}

function buildPriceMap(cells = []) {
  const map = {};
  for (const cell of cells) {
    map[priceKey(cell.from_zone_id, cell.to_zone_id)] = cell.price;
  }
  return map;
}

export default function PricingMatrix() {
  const { toast } = useToast();
  const [editingKey, setEditingKey] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const { data, mutate } = useSWR('/api/admin/transfer-zone-prices', authFetcher);

  const zones = data?.zones ?? [];
  const cells = data?.cells ?? [];
  const priceMap = buildPriceMap(cells);

  const startEdit = (fromId, toId, currentPrice) => {
    const key = priceKey(fromId, toId);
    setEditingKey(key);
    setInputValue(currentPrice != null ? String(currentPrice) : '');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = async (fromId, toId) => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || parsed < 0) {
      setEditingKey(null);
      return;
    }

    const previousData = data;
    const optimisticCells = cells.filter((c) => !(c.from_zone_id === fromId && c.to_zone_id === toId));
    optimisticCells.push({ from_zone_id: fromId, to_zone_id: toId, price: parsed, currency: 'USD' });

    mutate({ ...data, cells: optimisticCells }, false);
    setEditingKey(null);

    const res = await upsertTransferZonePrice({
      from_zone_id: fromId,
      to_zone_id: toId,
      price: parsed,
      currency: 'USD',
    });

    if (!res.success) {
      mutate(previousData, false);
      toast({ title: res.message || 'Failed to save price', variant: 'destructive' });
    }
  };

  const handleKeyDown = (e, fromId, toId) => {
    if (e.key === 'Enter') commitEdit(fromId, toId);
    if (e.key === 'Escape') setEditingKey(null);
  };

  if (zones.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="grid place-items-center text-gray-400 py-16">Create zones first before setting prices.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 bg-muted font-medium border-b border-r min-w-[140px]">From \ To</th>
              {zones.map((z) => (
                <th key={z.id} className="p-3 bg-muted font-medium border-b border-r text-center min-w-[110px]">
                  {z.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((fromZone) => (
              <tr key={fromZone.id} className="hover:bg-muted/30">
                <td className="p-3 font-medium border-b border-r bg-muted/20">{fromZone.name}</td>
                {zones.map((toZone) => {
                  const key = priceKey(fromZone.id, toZone.id);
                  const price = priceMap[key];
                  const isEditing = editingKey === key;

                  return (
                    <td key={toZone.id} className="border-b border-r text-center p-1 cursor-pointer" onClick={() => !isEditing && startEdit(fromZone.id, toZone.id, price)}>
                      {isEditing ? (
                        <Input
                          ref={inputRef}
                          type="number"
                          step="0.01"
                          min="0"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onBlur={() => commitEdit(fromZone.id, toZone.id)}
                          onKeyDown={(e) => handleKeyDown(e, fromZone.id, toZone.id)}
                          className="h-8 text-center w-24 mx-auto"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="px-2 py-1 rounded hover:bg-muted transition-colors">{price != null ? `$${parseFloat(price).toFixed(2)}` : '—'}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">Click any cell to edit. Diagonal = same-zone transfer.</p>
    </div>
  );
}

function Header() {
  return (
    <div>
      <div className="flex flex-row items-center gap-2">
        <Link href="/dashboard/admin/transfers/zones" className="hover:bg-slate-50 rounded" aria-label="Back to zones">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-semibold">Zone Pricing Matrix</h1>
      </div>
      <p className="text-sm text-muted-foreground">Set base prices for transfers between zones</p>
    </div>
  );
}
