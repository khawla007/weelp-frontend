'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { debounce } from 'lodash';
import { authFetcher } from '@/lib/fetchers';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomPagination } from '@/app/components/Pagination';
import { assignLocationsToZone, unassignLocationsFromZone } from '@/lib/actions/transferZoneLocations';

const TYPE_COLORS = {
  city: 'default',
  airport: 'secondary',
  station: 'outline',
  hotel: 'secondary',
  place: 'outline',
};

export default function ManageLocationsTable({ zone }) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [assignFilter, setAssignFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter);
    if (assignFilter && assignFilter !== 'all') params.append('filter', assignFilter);
    params.append('page', page);
    params.append('per_page', 15);
    return params.toString();
  }, [debouncedSearch, typeFilter, assignFilter, page]);

  const { data, isValidating, error, mutate } = useSWR(`/api/admin/transfer-zones/${zone.id}/locations?${query}`, authFetcher);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const perPage = data?.per_page ?? 15;
  const currentPage = data?.current_page ?? 1;

  const rowKey = (row) => `${row.locatable_type}:${row.locatable_id}`;

  const allSelected = rows.length > 0 && rows.every((r) => selectedKeys.includes(rowKey(r)));

  const handleToggleSelect = (key, checked) => {
    setSelectedKeys((prev) => (checked ? [...prev, key] : prev.filter((k) => k !== key)));
  };

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      const keys = rows.map(rowKey);
      setSelectedKeys((prev) => [...new Set([...prev, ...keys])]);
    } else {
      const keys = new Set(rows.map(rowKey));
      setSelectedKeys((prev) => prev.filter((k) => !keys.has(k)));
    }
  };

  const buildLocations = (keys) =>
    keys.map((key) => {
      const [locatable_type, locatable_id] = key.split(':');
      return { locatable_type, locatable_id: Number(locatable_id) };
    });

  const handleSingleAction = async (row) => {
    const location = [{ locatable_type: row.locatable_type, locatable_id: row.locatable_id }];
    setLoading(true);
    const action = row.assigned_to_current ? unassignLocationsFromZone : assignLocationsToZone;
    const res = await action(zone.id, location);
    setLoading(false);
    if (!res.success) {
      toast({ title: res.message || 'Action failed', variant: 'destructive' });
      return;
    }
    toast({ title: res.message });
    mutate();
  };

  const handleBulkAssign = async () => {
    if (selectedKeys.length === 0) return;
    setLoading(true);
    const res = await assignLocationsToZone(zone.id, buildLocations(selectedKeys));
    setLoading(false);
    if (!res.success) {
      toast({ title: res.message || 'Bulk assign failed', variant: 'destructive' });
      return;
    }
    toast({ title: res.message });
    setSelectedKeys([]);
    mutate();
  };

  const handleBulkRemove = async () => {
    if (selectedKeys.length === 0) return;
    setLoading(true);
    const res = await unassignLocationsFromZone(zone.id, buildLocations(selectedKeys));
    setLoading(false);
    if (!res.success) {
      toast({ title: res.message || 'Bulk remove failed', variant: 'destructive' });
      return;
    }
    toast({ title: res.message });
    setSelectedKeys([]);
    mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-row items-center gap-2">
          <Link href="/dashboard/admin/transfers/zones" className="hover:bg-slate-50 rounded" aria-label="Back to zones">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold">Zone: {zone.name} — Location Assignment</h1>
        </div>
        <p className="text-sm text-muted-foreground">Assign or remove locations from this pricing zone.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input value={search} onChange={handleSearchChange} placeholder="Search by location name..." className="max-w-xs" />
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="city">City</SelectItem>
            <SelectItem value="airport">Airport</SelectItem>
            <SelectItem value="station">Station</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="place">Place</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={assignFilter}
          onValueChange={(v) => {
            setAssignFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>

        {selectedKeys.length > 0 && (
          <>
            <Button onClick={handleBulkAssign} disabled={loading} size="sm">
              Assign {selectedKeys.length} selected
            </Button>
            <Button onClick={handleBulkRemove} disabled={loading} variant="destructive" size="sm">
              Remove {selectedKeys.length} selected
            </Button>
          </>
        )}
      </div>

      {isValidating && <span className="loader" />}
      {error && <span className="text-red-500">Failed to load locations</span>}

      {!error && (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={(v) => handleToggleSelectAll(Boolean(v))} aria-label="Select all" />
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Current Zone(s)</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No locations found.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((row) => {
                  const key = rowKey(row);
                  return (
                    <TableRow key={key}>
                      <TableCell>
                        <Checkbox checked={selectedKeys.includes(key)} onCheckedChange={(v) => handleToggleSelect(key, Boolean(v))} />
                      </TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground">{row.city_name || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{row.country_name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={TYPE_COLORS[row.type] ?? 'outline'} className="capitalize">
                          {row.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {row.current_zones?.length > 0 ? (
                            row.current_zones.map((z) => (
                              <Badge key={z.id} variant="secondary" className="text-xs">
                                {z.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant={row.assigned_to_current ? 'destructive' : 'default'} disabled={loading} onClick={() => handleSingleAction(row)}>
                          {row.assigned_to_current ? 'Remove' : 'Assign'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <CustomPagination
            totalItems={total}
            itemsPerPage={perPage}
            currentPage={currentPage}
            onPageChange={(p) => {
              setPage(p);
              setSelectedKeys([]);
            }}
          />
        </>
      )}
    </div>
  );
}
