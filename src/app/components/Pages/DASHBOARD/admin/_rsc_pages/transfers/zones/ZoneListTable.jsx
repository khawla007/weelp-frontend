'use client';

import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, MapPin, Pencil, Trash2 } from 'lucide-react';

export default function ZoneListTable({ zones = [], selectedIds = [], onToggleSelect, onToggleSelectAll, onToggleStatus, onDelete }) {
  const allSelected = zones.length > 0 && selectedIds.length === zones.length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={(v) => onToggleSelectAll?.(Boolean(v))} aria-label="Select all zones" />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Locations</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {zones.map((z) => (
            <TableRow key={z.id}>
              <TableCell>
                <Checkbox checked={selectedIds.includes(z.id)} onCheckedChange={(v) => onToggleSelect?.(z.id, Boolean(v))} />
              </TableCell>
              <TableCell className="font-medium">{z.name}</TableCell>
              <TableCell className="text-muted-foreground">{z.slug}</TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate">{z.description || '—'}</TableCell>
              <TableCell>
                <Badge className="gap-1 bg-[#DC3545] text-white hover:bg-[#DC3545]/90">
                  <MapPin className="h-3 w-3" />
                  {z.locations_count ?? 0}
                </Badge>
              </TableCell>
              <TableCell>{z.sort_order ?? 0}</TableCell>
              <TableCell>
                <Switch checked={Boolean(z.is_active)} onCheckedChange={(v) => onToggleStatus?.(z.id, Boolean(v))} className="data-[state=checked]:bg-secondaryDark" />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="Zone actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/admin/transfers/zones/edit/${z.id}`}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/admin/transfers/zones/${z.id}/locations`}>
                        <MapPin className="h-4 w-4 mr-2" /> Manage Locations
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDelete?.(z.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
