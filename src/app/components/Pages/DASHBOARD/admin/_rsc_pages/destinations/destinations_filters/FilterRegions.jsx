'use client';
import React, { useEffect, useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import useSWR from 'swr';
import debounce from 'lodash.debounce';
import { authFetcher } from '@/lib/fetchers';
import { DashboardSearch } from '@/app/components/DashboardShared';
import { CustomPagination } from '@/app/components/Pagination';
import { AddNewButton } from '@/app/components/Button/AddNewButton';
import { Ellipsis, Pencil, Trash2, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { useToast } from '@/hooks/use-toast';
import { deleteRegion } from '@/lib/actions/regionActions';

/**
 * Simple RegionCard for displaying regions
 */
const RegionCard = ({ id, name, type, description, image_url, countries_count = 0 }) => {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { toast } = useToast();

  const handleRoute = () => {
    router.push(`/dashboard/admin/destinations/regions/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      const res = await deleteRegion(id);
      if (res?.success) {
        mutate((key) => key.startsWith('/api/admin/regions'), undefined, { revalidate: true });
        toast({ title: res.message || 'Deleted Successfully' });
      } else {
        toast({ title: res?.error || 'Something went wrong', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Something went wrong', variant: 'destructive' });
      console.error('Failed to delete region', err);
    }
  };

  return (
    <Card className="sm:max-w-xs overflow-hidden rounded-lg border">
      {/* Image section */}
      <div className="relative w-full h-40 bg-gradient-to-br from-brand-100 to-brand-200">
        {image_url ? (
          <img src={image_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe size={48} className="text-brand-500" />
          </div>
        )}
      </div>

      {/* Content section */}
      <CardContent>
        <div className="flex justify-between pt-4">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>{type}</CardDescription>
          </div>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Ellipsis size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" sideOffset={10}>
              <DropdownMenuItem className="cursor-pointer" onClick={handleRoute}>
                <Pencil size={14} className="mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-400">
                <Trash2 size={14} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <p className="text-sm text-gray-600 line-clamp-2">{description || 'No description'}</p>
        {/* Badges */}
        <div className="flex items-center gap-2">
          <Badge className="bg-accent text-black hover:bg-accent">{type}</Badge>
          <Badge variant="outline">
            {countries_count} {countries_count === 1 ? 'Country' : 'Countries'}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
};

export const FilterRegions = () => {
  const methods = useForm({ defaultValues: { query: '', page: 1 } });
  const { control, setValue } = methods;
  const page = useWatch({ control, name: 'page' });
  const query = useWatch({ control, name: 'query' });

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce query updates - handle in useEffect with cleanup
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  const { data, error, isValidating } = useSWR(`/api/admin/regions?name=${debouncedQuery}&page=${page}`, authFetcher);

  // destructure API response
  const { data: regions = [], total = 0, per_page: perPage = 0, last_page: lastPage = 1, current_page: currentPage = 1 } = data || {};

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        {/* Search */}
        <div className="flex justify-between items-center">
          <DashboardSearch control={control} name="query" placeholder="Search Regions" className="max-w-sm" />
          <AddNewButton label="Add New" href="/dashboard/admin/destinations/regions/new" />
        </div>

        {/* RESULT Found */}
        <div className="flex flex-col gap-4 h-full">
          {/* Loading State */}
          {isValidating && <span className="loader"></span>}

          {/* Error State */}
          {!isValidating && error && <div className="text-red-500 text-center py-4">Failed to load data. Please try again.</div>}

          {/* No Items Found */}
          {!isValidating && !error && regions.length === 0 && <div className="text-gray-500 text-center py-4">No regions found.</div>}

          {/* For regions */}
          {!isValidating && !error && regions.length > 0 && (
            <div className="flex flex-col gap-4">
              <Card className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-inherit shadow-none border-none">
                {regions.map((region) => (
                  <RegionCard key={region?.id} {...region} />
                ))}
              </Card>

              {/* Pagination - outside form to avoid nesting */}
              <CustomPagination totalItems={total} itemsPerPage={perPage} currentPage={currentPage} onPageChange={(newPage) => setValue('page', newPage)} />
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};
