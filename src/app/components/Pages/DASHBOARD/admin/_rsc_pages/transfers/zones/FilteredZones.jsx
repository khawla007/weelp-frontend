'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { authFetcher } from '@/lib/fetchers';
import { debounce } from 'lodash';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Grid3x3, Map } from 'lucide-react';
import ZoneListTable from './ZoneListTable';
import { CustomPagination } from '@/app/components/Pagination';
import {
  bulkDeleteTransferZones,
  deleteTransferZone,
  toggleTransferZoneStatus,
} from '@/lib/actions/transferZone';

export default function FilteredZones() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const debouncedSet = useMemo(() => debounce((v) => setDebouncedSearch(v), 400), []);

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearch(v);
    setPage(1);
    debouncedSet(v);
  };

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('q', debouncedSearch);
    params.append('page', page);
    params.append('per_page', 15);
    return params.toString();
  }, [debouncedSearch, page]);

  const { data, isValidating, error, mutate } = useSWR(
    `/api/admin/transfer-zones?${query}`,
    authFetcher,
  );

  const zones = data?.data ?? [];
  const total = data?.total ?? 0;
  const perPage = data?.per_page ?? 15;
  const currentPage = data?.current_page ?? 1;

  const handleToggleSelect = (id, selected) => {
    setSelectedIds((prev) => (selected ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleToggleSelectAll = (selected) => {
    setSelectedIds(selected ? zones.map((z) => z.id) : []);
  };

  const handleToggleStatus = async (id, isActive) => {
    const res = await toggleTransferZoneStatus(id, isActive);
    if (!res.success) {
      toast({ title: res.message || 'Failed to update status', variant: 'destructive' });
      return;
    }
    mutate();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this zone? This also removes its location assignments and price-matrix cells.')) return;
    const res = await deleteTransferZone(id);
    if (!res.success) {
      toast({ title: res.message || 'Failed to delete zone', variant: 'destructive' });
      return;
    }
    toast({ title: res.message });
    mutate();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} zone(s)?`)) return;
    const res = await bulkDeleteTransferZones(selectedIds);
    if (!res.success) {
      toast({ title: res.message || 'Bulk delete failed', variant: 'destructive' });
      return;
    }
    toast({ title: res.message });
    setSelectedIds([]);
    mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Zones</h1>
          <p className="text-sm text-muted-foreground">
            Manage pricing zones for location-based fare calculation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/transfers/zones/pricing-matrix">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Pricing Matrix
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/admin/transfers/zones/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Link>
          </Button>
        </div>
      </div>

      <Card className="p-5 relative max-w-96">
        <div className="text-sm text-muted-foreground">Total Zones</div>
        <div className="mt-[25px] text-4xl font-semibold text-[#DC3545]">{total}</div>
        <div className="mt-[5px] text-sm text-muted-foreground">All zones</div>
        <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-muted grid place-items-center">
          <Map className="h-4 w-4 text-muted-foreground" />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Input
          value={search}
          onChange={handleSearchChange}
          placeholder="Search zone by name or slug..."
          className="max-w-sm"
        />
        {selectedIds.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            Delete {selectedIds.length} selected
          </Button>
        )}
      </div>

      {isValidating && <span className="loader" />}
      {error && <span className="text-red-500">Failed to load zones</span>}

      {!error && (
        <>
          {zones.length > 0 ? (
            <ZoneListTable
              zones={zones}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ) : (
            <div className="grid place-items-center text-gray-400 py-12">
              No zones found. Create your first one.
            </div>
          )}
          <CustomPagination
            totalItems={total}
            itemsPerPage={perPage}
            currentPage={currentPage}
            onPageChange={(p) => {
              setPage(p);
              setSelectedIds([]);
            }}
          />
        </>
      )}
    </div>
  );
}
