'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight } from 'lucide-react';
import { TableActions } from '@/app/components/Shared/TableActions';

export default function RouteListTable({ routes = [], selectedIds = [], onToggleSelect, onToggleSelectAll, onToggleStatus, onTogglePopular, onDelete }) {
  const allSelected = routes.length > 0 && selectedIds.length === routes.length;

  const getLocationName = (loc) => loc?.name ?? '—';

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={(v) => onToggleSelectAll?.(Boolean(v))} aria-label="Select all routes" />
            </TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Distance / Duration</TableHead>
            <TableHead>Zones</TableHead>
            <TableHead>Popular</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <Checkbox checked={selectedIds.includes(r.id)} onCheckedChange={(v) => onToggleSelect?.(r.id, Boolean(v))} />
              </TableCell>
              <TableCell>
                <div className="font-medium">{r.name}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <span>{getLocationName(r.origin)}</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                  <span>{getLocationName(r.destination)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{r.distance_km != null ? `${r.distance_km} km` : '—'}</div>
                <div className="text-xs text-muted-foreground">{r.duration_minutes != null ? `${r.duration_minutes} min` : '—'}</div>
              </TableCell>
              {(() => {
                const fromZone = r.from_zone ?? r.fromZone;
                const toZone = r.to_zone ?? r.toZone;
                return (
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {fromZone?.name && <div>From: {fromZone.name}</div>}
                      {toZone?.name && <div>To: {toZone.name}</div>}
                      {!fromZone && !toZone && '—'}
                    </div>
                  </TableCell>
                );
              })()}
              <TableCell>
                <Button size="icon" variant="ghost" onClick={() => onTogglePopular?.(r.id)} aria-label="Toggle popular">
                  <Star className={`h-4 w-4 ${r.is_popular ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                </Button>
              </TableCell>
              <TableCell>
                <Switch checked={Boolean(r.is_active)} onCheckedChange={() => onToggleStatus?.(r.id)} className="data-[state=checked]:bg-secondaryDark" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <TableActions id={r.id} editUrl={`/dashboard/admin/transfers/routes/edit/${r.id}`} onDelete={onDelete} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
