'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import debounce from 'lodash.debounce';
import useSWR from 'swr';
import { FileText, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomPagination } from '@/app/components/Pagination';
import { DashboardSearch, ListingCard, ListingCardContent, ListingCardTitle, ListingCardActions, ListingCardSkeleton } from '@/app/components/DashboardShared';
import { AddNewButton } from '@/app/components/Button/AddNewButton';
import { fetcher } from '@/lib/fetchers';
import { useToast } from '@/hooks/use-toast';
import { deletePage } from '@/lib/actions/pages';
import { PAGE_SORT_OPTIONS, PAGE_STATUS, PAGE_STATUS_OPTIONS } from '@/lib/pages/normalizers';

const formatDate = (value) => {
  if (!value) return 'Not updated yet';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
};

export default function FilterPagesPage() {
  const { toast } = useToast();
  const [modalState, setModalState] = useState({
    openDropdownIndex: '',
    openDialogIndex: '',
  });

  const { control, setValue } = useForm({
    defaultValues: {
      search: '',
      status: 'all',
      sort_by: 'latest',
      page: 1,
    },
  });
  const filters = useWatch({ control });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const debouncedUpdate = useMemo(
    () =>
      debounce((newFilters) => {
        setDebouncedFilters(newFilters);
      }, 500),
    [],
  );

  useEffect(() => {
    const { page, ...otherFilters } = filters;
    debouncedUpdate(otherFilters);
    return () => debouncedUpdate.cancel();
  }, [filters.search, filters.status, filters.sort_by, debouncedUpdate]);

  useEffect(() => {
    setValue('page', 1);
  }, [filters.search, filters.status, filters.sort_by, setValue]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append('per_page', '3');
    if (debouncedFilters.search) params.append('search', debouncedFilters.search);
    if (debouncedFilters.status && debouncedFilters.status !== 'all') params.append('status', debouncedFilters.status);
    if (debouncedFilters.sort_by) params.append('sort_by', debouncedFilters.sort_by);
    if (filters.page) params.append('page', filters.page);

    return params.toString();
  }, [debouncedFilters, filters.page]);

  const { data, error, isValidating, mutate } = useSWR(`/api/admin/pages?${queryParams}`, fetcher, { revalidateIfStale: true });
  const { data: items = [], current_page = 1, per_page = 3, total: totalItems = 0 } = data?.data || {};

  const closeDialog = () => {
    setModalState((prev) => ({ ...prev, openDialogIndex: '' }));
  };

  async function handleDelete(itemId) {
    try {
      const res = await deletePage(itemId);

      if (!res.success) {
        toast({ title: res.message || 'Error deleting page', variant: 'destructive' });
        return;
      }

      toast({ title: res.message || 'Page deleted', variant: 'success' });
      mutate();
      closeDialog();
    } catch (deleteError) {
      console.error(deleteError);
      toast({ title: 'Error deleting page', variant: 'destructive' });
    }
  }

  const handlePageChange = (newPage) => {
    setValue('page', newPage, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Card className="flex gap-4 flex-col lg:flex-row">
      <div className="lg:w-1/4 space-y-6 p-4">
        <div className="space-y-2">
          <DashboardSearch control={control} placeholder="Search Pages" />
        </div>

        <div className="space-y-3">
          <p className="flex items-center gap-3 text-sm font-medium">
            <SlidersHorizontal size={18} /> Status
          </p>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="focus:ring-0">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PAGE_STATUS_OPTIONS.map(({ name, value }) => (
                      <SelectItem key={value} value={value}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="lg:w-3/4 p-4 space-y-4">
        <div className="flex justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">Pages</h1>
            <p className="text-sm text-muted-foreground">Search, publish, edit, and delete CMS pages.</p>
          </div>

          <div className="space-y-4 flex flex-col">
            <AddNewButton label="Add New" href="/dashboard/admin/pages/new" />

            <Controller
              name="sort_by"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Sort pages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PAGE_SORT_OPTIONS.map(({ name, value }) => (
                        <SelectItem key={value} value={value} className="cursor-pointer">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full">
          {isValidating && <ListingCardSkeleton />}
          {!isValidating && error && <div className="text-destructive text-center">Failed to load pages. Please try again.</div>}
          {!isValidating && !error && items.length === 0 && <div className="text-muted-foreground text-center">No pages found.</div>}

          {!isValidating && !error && items.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map(({ id: itemId, title, slug, excerpt, status, updated_at }) => (
                  <ListingCard key={itemId}>
                    <ListingCardContent>
                      <ListingCardTitle
                        actions={
                          <ListingCardActions
                            itemId={itemId}
                            editHref={`/dashboard/admin/pages/${itemId}`}
                            onDelete={handleDelete}
                            isOpen={modalState.openDropdownIndex === itemId}
                            onOpenChange={(open) => {
                              setModalState((prev) => ({ ...prev, openDropdownIndex: open ? itemId : '' }));
                            }}
                            isDialogOpen={modalState.openDialogIndex === itemId}
                            onDialogChange={(open) => {
                              if (!open) closeDialog();
                            }}
                          />
                        }
                      >
                        {title}
                      </ListingCardTitle>

                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText size={14} />
                        /pages/{slug || 'draft-slug'}
                      </p>

                      <div className="flex items-center gap-2">
                        <b>Status:</b>
                        <Badge className={status === PAGE_STATUS.published ? 'bg-weelp-sage-deep' : 'bg-warning'}>{status === PAGE_STATUS.published ? 'Published' : 'Draft'}</Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">Updated {formatDate(updated_at)}</p>
                      {excerpt && <p className="bg-card text-foreground text-sm text-wrap">{excerpt}</p>}
                    </ListingCardContent>
                  </ListingCard>
                ))}
              </div>

              <CustomPagination totalItems={totalItems} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
