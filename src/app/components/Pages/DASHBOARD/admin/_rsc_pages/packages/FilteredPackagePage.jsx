'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';
import debounce from 'lodash.debounce';
import { Badge } from '@/components/ui/badge';
import { CustomPagination } from '@/app/components/Pagination';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';
import { useToast } from '@/hooks/use-toast';
import { BulkActionButtons } from '@/app/components/BulkActions/BulkActionButtons';
import { AddNewButton } from '@/app/components/Button/AddNewButton';
import {
  SortDropdown,
  ListingFilterSidebar,
  ListingCard,
  ListingCardImage,
  ListingCardBadge,
  ListingCardCheckbox,
  ListingCardContent,
  ListingCardTitle,
  ListingCardMeta,
  ListingCardTags,
  ListingCardStats,
  ListingCardActions,
} from '@/app/components/DashboardShared';
import { deleteMultiplePackages, deletePackage } from '@/lib/actions/packages';

const FilterPackage = ({ categories = [], difficulties = [], durations = [] }) => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [modalState, setModalState] = useState({
    openDropdownIndex: '',
    openDialogIndex: '',
  });

  const { setValue, control } = useForm({
    defaultValues: {
      name: '',
      category: '',
      difficulty_level: '',
      duration: '',
      season: '',
      sort_by: 'default',
      page: 1,
      price: [50, 2000],
    },
  });
  const filters = useWatch({ control: control });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const handleDeleteClick = (index) => {
    setModalState({
      openDropdownIndex: '',
      openDialogIndex: index,
    });
  };

  const closeDialog = () => {
    setModalState((prev) => ({ ...prev, openDialogIndex: '' }));
  };

  async function handleDelete(itemId) {
    try {
      await deletePackage(itemId);

      toast({
        title: 'Package deleted',
        variant: 'success',
      });

      mutate();
      closeDialog();
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error deleting item',
        variant: 'destructive',
      });
    }
  }

  const handlePageChange = (newPage) => {
    setValue('page', newPage, { shouldValidate: true, shouldDirty: true });
    setSelectedItems([]);
    setIsAllSelected(false);
  };

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
    setIsAllSelected(!isAllSelected);
  };

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
  }, [filters.name, filters.category, filters.difficulty_level, filters.duration, filters.season, filters.sort_by, filters.price?.[0], filters.price?.[1], debouncedUpdate]);

  useEffect(() => {
    setValue('page', 1);
  }, [filters.name, filters.category, filters.difficulty_level, filters.duration, filters.season, filters.sort_by, filters.price?.[0], filters.price?.[1], setValue]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (debouncedFilters.name) params.append('search', debouncedFilters.name);
    if (debouncedFilters.category) params.append('category', debouncedFilters.category);
    if (debouncedFilters.difficulty_level) params.append('difficulty_level', debouncedFilters.difficulty_level);
    if (debouncedFilters.duration) params.append('duration', debouncedFilters.duration);
    if (debouncedFilters.season) params.append('season', debouncedFilters.season);
    if (debouncedFilters.sort_by) params.append('sort_by', debouncedFilters.sort_by);
    if (debouncedFilters.price?.[0]) params.append('min_price', debouncedFilters.price[0]);
    if (debouncedFilters.price?.[1]) params.append('max_price', debouncedFilters.price[1]);
    if (filters.page) params.append('page', filters.page);

    return params.toString();
  }, [debouncedFilters, filters.page]);

  const { data, error, isValidating, mutate } = useSWR(`/api/admin/packages?${queryParams}`, fetcher, { revalidateOnFocus: true });

  const { data: items = [], current_page = '', per_page = '', total: totalItems = '' } = data?.data || {};

  const handleMultpleDelete = async () => {
    try {
      const res = await deleteMultiplePackages(selectedItems);
      if (res.success) {
        toast({ title: 'Packages deleted', variant: 'success' });

        mutate();

        setSelectedItems([]);
        setIsAllSelected(false);
      } else {
        toast({
          title: 'Delete failed',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({ title: 'Something went wrong', variant: 'destructive' });

      setSelectedItems([]);
      setIsAllSelected(false);
    }
  };

  const handleMultpleExport = () => {
    console.log(selectedItems, 'delete');
  };

  return (
    <Card className="flex gap-4 flex-col lg:flex-row ">
      {/* Sidebar Filter */}
      <ListingFilterSidebar control={control} filters={filters} categories={categories} difficulties={difficulties} durations={durations} searchPlaceholder="Search Package" />

      {/* Filtered Items Output */}
      <div className="lg:w-3/4 p-4 space-y-4">
        {/* Sidebar */}
        <div className="flex justify-start lg:justify-end flex-wrap">
          <div className="space-y-4 flex flex-col ">
            {selectedItems.length > 0 ? (
              <BulkActionButtons
                selectedCount={selectedItems.length}
                totalCount={items.length}
                isAllSelected={isAllSelected}
                onSelectAllToggle={handleSelectAllToggle}
                onDelete={handleMultpleDelete}
              />
            ) : (
              <AddNewButton label="Add New" href="/dashboard/admin/package-builder/new" />
            )}

            <SortDropdown control={control} />
          </div>
        </div>

        {/* Result  Found  */}
        <div className="flex flex-col gap-4 h-full">
          {/* Loading State */}
          {isValidating && <span className="loader"></span>}

          {/* Error State */}
          {!isValidating && error && <div className="text-red-500 text-center">Failed to load data. Please try again.</div>}

          {/* Empty State */}
          {!isValidating && !error && items.length === 0 && <div className="text-gray-500 text-center">No items found.</div>}

          {/* For Items */}
          {!isValidating && !error && items.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 ">
                {items.map(({ id: itemId, name, media_gallery = [], tags = [], attributes = [], is_featured }, index) => (
                  <ListingCard key={index}>
                    {/* Featured Badge */}
                    {is_featured && <ListingCardBadge type="featured" />}

                    {/* Image */}
                    <ListingCardImage src={media_gallery?.[0]?.url} alt={`${name} image`} />

                    {/* Checkbox for bulk selection */}
                    <ListingCardCheckbox
                      checked={selectedItems.includes(itemId)}
                      onCheckedChange={(checked, id) => {
                        setSelectedItems((prev) => {
                          const newSelection = checked ? [...prev, id] : prev.filter((itemId) => itemId !== id);
                          setIsAllSelected(newSelection.length === items.length);
                          return newSelection;
                        });
                      }}
                      itemId={itemId}
                    />

                    {/* Content */}
                    <ListingCardContent>
                      <ListingCardTitle
                        actions={
                          <ListingCardActions
                            itemId={itemId}
                            editHref={`/dashboard/admin/package-builder/${itemId}`}
                            onDelete={handleDelete}
                            isOpen={modalState.openDropdownIndex === itemId}
                            onOpenChange={(open) => {
                              setModalState((prev) => ({
                                ...prev,
                                openDropdownIndex: open ? itemId : '',
                              }));
                            }}
                            isDialogOpen={modalState.openDialogIndex === itemId}
                            onDialogChange={(open) => {
                              if (!open) closeDialog();
                            }}
                          />
                        }
                      >
                        {name}
                      </ListingCardTitle>

                      {/* Duration attribute */}
                      {attributes.length > 0 &&
                        attributes.map(({ attribute_name }, index) => {
                          return (
                            attribute_name === 'Duration' && (
                              <ListingCardMeta key={index} icon={Clock}>
                                3 Hours
                              </ListingCardMeta>
                            )
                          );
                        })}

                      {/* Tags */}
                      {tags.length > 0 && (
                        <ListingCardTags>
                          {tags.map(({ tag_name }, index) => (
                            <Badge key={index} className={`bg-secondaryDark text-white hover:text-white hover:bg-secondaryDark ${index === 0 && 'bg-gray-400'}`}>
                              {tag_name}
                            </Badge>
                          ))}
                        </ListingCardTags>
                      )}

                      {/* Stats */}
                      <ListingCardStats>
                        <Badge className="bg-secondarylight hover:bg-secondarylight text-secondaryDark">4.8</Badge>
                        <ListingCardMeta icon={Users}>1200 Bookings</ListingCardMeta>
                      </ListingCardStats>
                    </ListingCardContent>
                  </ListingCard>
                ))}
              </div>

              {/* Pagination */}
              <CustomPagination totalItems={totalItems} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FilterPackage;
