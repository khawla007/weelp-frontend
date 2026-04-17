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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus } from 'lucide-react';
import RouteListTable from './RouteListTable';
import { CustomPagination } from '@/app/components/Pagination';
import {
  bulkDeleteTransferRoutes,
  deleteTransferRoute,
  toggleTransferRouteStatus,
  toggleTransferRoutePopular,
} from '@/lib/actions/transferRoute';

export default function FilteredRoutes() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [popularFilter, setPopularFilter] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, mode: null, id: null });

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
    if (statusFilter) params.append('status', statusFilter);
    if (popularFilter) params.append('popular', popularFilter);
    params.append('page', page);
    params.append('per_page', 15);
    return params.toString();
  }, [debouncedSearch, statusFilter, popularFilter, page]);

  const { data, isValidating, error, mutate } = useSWR(
    `/api/admin/transfer-routes?${query}`,
    authFetcher,
  );

  const routes = data?.data ?? [];
  const total = data?.total ?? 0;
  const perPage = data?.per_page ?? 15;
  const currentPage = data?.current_page ?? 1;

  const handleToggleSelect = (id, selected) => {
    setSelectedIds((prev) => (selected ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleToggleSelectAll = (selected) => {
    setSelectedIds(selected ? routes.map((r) => r.id) : []);
  };

  const handleToggleStatus = async (id) => {
    const res = await toggleTransferRouteStatus(id);
    if (!res.success) {
      toast({ title: res.message || 'Failed to update status', variant: 'destructive' });
      return;
    }
    mutate();
  };

  const handleTogglePopular = async (id) => {
    const res = await toggleTransferRoutePopular(id);
    if (!res.success) {
      toast({ title: res.message || 'Failed to update popular', variant: 'destructive' });
      return;
    }
    mutate();
  };

  const requestDelete = (id) => setDeleteDialog({ open: true, mode: 'single', id });
  const requestBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteDialog({ open: true, mode: 'bulk', id: null });
  };
  const closeDeleteDialog = () => setDeleteDialog({ open: false, mode: null, id: null });

  const confirmDelete = async () => {
    if (deleteDialog.mode === 'single' && deleteDialog.id) {
      const res = await deleteTransferRoute(deleteDialog.id);
      closeDeleteDialog();
      if (!res.success) {
        toast({ title: res.message || 'Failed to delete route', variant: 'destructive' });
        return;
      }
      toast({ title: res.message });
      mutate();
      return;
    }
    if (deleteDialog.mode === 'bulk') {
      const res = await bulkDeleteTransferRoutes(selectedIds);
      closeDeleteDialog();
      if (!res.success) {
        toast({ title: res.message || 'Bulk delete failed', variant: 'destructive' });
        return;
      }
      toast({ title: res.message });
      setSelectedIds([]);
      mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Transfer Routes</h1>
          <p className="text-sm text-muted-foreground">
            Manage fixed routes between pickup and drop-off locations.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/transfers/routes/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Route
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Total Routes</div>
        <div className="text-2xl font-semibold">{total}</div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={handleSearchChange}
          placeholder="Search routes..."
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={popularFilter} onValueChange={(v) => { setPopularFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All routes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All routes</SelectItem>
            <SelectItem value="1">Popular</SelectItem>
            <SelectItem value="0">Not popular</SelectItem>
          </SelectContent>
        </Select>
        {selectedIds.length > 0 && (
          <Button variant="destructive" onClick={requestBulkDelete}>
            Delete {selectedIds.length} selected
          </Button>
        )}
      </div>

      {isValidating && <span className="loader" />}
      {error && <span className="text-red-500">Failed to load routes</span>}

      {!error && (
        <>
          {routes.length > 0 ? (
            <RouteListTable
              routes={routes}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleStatus={handleToggleStatus}
              onTogglePopular={handleTogglePopular}
              onDelete={requestDelete}
            />
          ) : (
            <div className="grid place-items-center text-gray-400 py-12">
              No routes found. Create your first one.
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

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.mode === 'bulk'
                ? `This will permanently delete ${selectedIds.length} route(s). This action cannot be undone.`
                : 'This will permanently delete the route. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
