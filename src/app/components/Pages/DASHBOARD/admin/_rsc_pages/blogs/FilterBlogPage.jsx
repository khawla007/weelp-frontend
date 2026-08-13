'use client';

import { useEffect, useState, useMemo } from 'react';
import { FieldSkeleton } from '@/app/components/Animation/Cards';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Tag } from 'lucide-react';
import debounce from 'lodash.debounce';
import { Badge } from '@/components/ui/badge';
import 'react-range-slider-input/dist/style.css';
import '@/app/styles/range-slider.css';
import { CustomPagination } from '@/app/components/Pagination';
import useSWR from 'swr'; // for states cache and ui management
import { fetcher } from '@/lib/fetchers'; // interceptors
import { useToast } from '@/hooks/use-toast';
import {
  DashboardSearch,
  ListingCard,
  ListingCardSkeleton,
  ListingCardImage,
  ListingCardCheckbox,
  ListingCardContent,
  ListingCardTitle,
  ListingCardTags,
  ListingCardActions,
} from '@/app/components/DashboardShared';
import { BulkActionButtons } from '@/app/components/BulkActions/BulkActionButtons';
import { AddNewButton } from '@/app/components/Button/AddNewButton';
import { deleteBlog, deleteMultipleBlogs } from '@/lib/actions/blogs';
import { useAlltagsOptionsAdmin } from '@/hooks/api/admin/tags';
import { useAllCategoriesOptionsAdmin } from '@/hooks/api/admin/categories';
import { FALLBACK_IMAGE } from '@/constants/image';
import BlogPublishedDate from '@/app/components/ui/BlogPublishedDate';

export const BLOGSORT_OPTIONS = [
  { name: 'Latest', value: 'latest' }, // ?sort_by=latest
  { name: 'Oldest', value: 'oldest' }, // ?sort_by=oldest
  { name: 'Title: A to Z', value: 'title_asc' }, // ?sort_by=title_asc
  { name: 'Title: Z to A', value: 'title_desc' }, // ?sort_by=title_desc
  { name: 'Published First', value: 'published_first' }, // ?sort_by=published_first
  { name: 'Draft First', value: 'draft_first' }, // ?sort_by=draft_first
];

const FilterBlog = () => {
  const [selectedItems, setSelectedItems] = useState([]); // selected item for multiple delete case
  const [isAllSelected, setIsAllSelected] = useState(false); // Track Select All toggle state
  const { categoriesList, isLoading: isCategoriesLoading, error: categoriesOptionError } = useAllCategoriesOptionsAdmin();
  const { tagList, isLoading: isTagLoading, error: tagOptionsError } = useAlltagsOptionsAdmin();

  const { toast } = useToast(); // intialize toast
  const [modalState, setModalState] = useState({
    openDropdownIndex: '', // string: index as string or "" for none
    openDialogIndex: '',
  });

  const { register, setValue, control, reset } = useForm({
    //initalize form
    defaultValues: {
      search: '',
      category: '',
      tag: '',
      sort_by: 'latest',
      page: 1,
    },
  });
  const filters = useWatch({ control: control }); // intialize watching

  const [debouncedFilters, setDebouncedFilters] = useState(filters); //

  //  handle delete to open modal
  const handleDeleteClick = (index) => {
    setModalState({
      openDropdownIndex: '',
      openDialogIndex: index,
    });
  };

  // colose dialog
  const closeDialog = () => {
    setModalState((prev) => ({ ...prev, openDialogIndex: '' }));
  };

  // handle for delete activity
  async function handleDelete(itemId) {
    try {
      await deleteBlog(itemId); // call server action

      toast({
        title: 'Blog deleted',
        variant: 'success',
      });

      mutate(); // trigger api
      closeDialog(); // close your dialog after success
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error deleting item',
        variant: 'destructive',
      });
    }
  }

  // handle page change
  const handlePageChange = (newPage) => {
    setValue('page', newPage, { shouldValidate: true, shouldDirty: true }); // through server side pagiantion
    setSelectedItems([]);
    setIsAllSelected(false);
  };

  // Toggle select all / unselect all
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

  // side effect for if filter change - exclude page from debouncing
  useEffect(() => {
    const { page, ...otherFilters } = filters;
    debouncedUpdate(otherFilters);
    return () => debouncedUpdate.cancel();
  }, [filters.search, filters.category, filters.tag, filters.sort_by, debouncedUpdate]);

  // Reset page to 1 when any filter other than page changes
  useEffect(() => {
    setValue('page', 1);
  }, [filters.search, filters.category, filters.tag, filters.sort_by, setValue]);

  // Memoized query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (debouncedFilters.search) params.append('search', debouncedFilters.search);
    if (debouncedFilters.category) params.append('category', debouncedFilters.category);
    if (debouncedFilters.tag) params.append('tag', debouncedFilters.tag);
    if (debouncedFilters.sort_by) params.append('sort_by', debouncedFilters.sort_by);
    if (filters.page) params.append('page', filters.page);

    return params.toString();
  }, [debouncedFilters, filters.page]);

  // SWR fetch
  const { data, error, isValidating, mutate } = useSWR(`/api/admin/blogs?${queryParams}`, fetcher, { revalidateIfStale: true });

  // destructure data
  const { data: items = [], current_page = '', per_page = '', total: totalItems = '' } = data?.data || {}; // destructure safely

  // handle Multiple Delete
  const handleMultpleDelete = async () => {
    try {
      const res = await deleteMultipleBlogs(selectedItems); // delete blogs
      if (res.success) {
        toast({ title: res.message, variant: 'success' });

        // Force update the UI
        mutate();

        // flush items
        setSelectedItems([]);
        setIsAllSelected(false);
      } else {
        toast({
          title: 'Delete failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({ title: 'Something went wrong', variant: 'destructive' });

      // flush items
      setSelectedItems([]);
      setIsAllSelected(false);
    }
  };

  // handle Multiple Export
  const handleMultpleExport = () => {
    console.log(selectedItems, 'delete');
  };

  return (
    <Card className="flex gap-4 flex-col lg:flex-row ">
      {/* Sidebar Filter */}
      <div className="lg:w-1/4  space-y-6 p-4 sm:h-[600px]">
        {/* Search */}
        <div className="space-y-2">
          <DashboardSearch control={control} placeholder="Search Blogs" />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <p className="flex items-center gap-4 font-medium">
            <Tag size={18} /> Categories
          </p>

          {isCategoriesLoading && <FieldSkeleton />}

          {!isCategoriesLoading && categoriesOptionError && (
            <span className="text-sm text-destructive">{categoriesOptionError?.message || `Failed to load categories <br> ${JSON.stringify(categoriesOptionError)}`}</span>
          )}
          {!isCategoriesLoading && !categoriesOptionError && categoriesList.length === 0 && <span className="text-sm text-muted-foreground">No categories found</span>}

          {!isCategoriesLoading && categoriesList.length > 0 && (
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-label="Filter blogs by category" className="focus:ring-0">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categoriesList.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <p className="flex items-center gap-4 font-medium">
            <Star size={18} /> Tags
          </p>

          {isTagLoading && <FieldSkeleton />}

          {!isTagLoading && tagOptionsError && <span className="text-sm text-destructive">{tagOptionsError?.message || `Failed to load tags <br> ${JSON.stringify(tagOptionsError)}`}</span>}
          {!isTagLoading && !tagOptionsError && tagList.length === 0 && <span className="text-sm text-muted-foreground">No tags found</span>}

          {!isTagLoading && tagList.length > 0 && (
            <Controller
              name="tag"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-label="Filter blogs by tag" className="focus:ring-0">
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {tagList.map((tag) => (
                        <SelectItem key={tag.slug} value={tag.slug}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </div>
      </div>

      {/* Filtered Items Output */}
      <div className="lg:w-3/4 p-4 space-y-4">
        {/* Sidebar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Controller
            name="sort_by"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger aria-label="Sort blogs" className="w-full sm:w-64">
                  <SelectValue placeholder="Sort blogs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {BLOGSORT_OPTIONS.map(({ name, value }) => (
                      <SelectItem key={value} value={value} className="cursor-pointer">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />

          {selectedItems.length > 0 ? (
            <BulkActionButtons selectedCount={selectedItems.length} totalCount={items.length} isAllSelected={isAllSelected} onSelectAllToggle={handleSelectAllToggle} onDelete={handleMultpleDelete} />
          ) : (
            <AddNewButton label="Add New" href="/dashboard/admin/blogs/new" className="!text-white hover:!text-white" />
          )}
        </div>

        {/* Result  Found  */}
        <div className="flex flex-col gap-4 h-full">
          {/* Loading State */}
          {isValidating && <ListingCardSkeleton />}

          {/* Error State */}
          {!isValidating && error && <div className="text-destructive text-center">Failed to load data. Please try again.</div>}

          {/* Empty State */}
          {!isValidating && !error && items.length === 0 && <div className="text-muted-foreground text-center">No items found.</div>}

          {/* For Items */}
          {!isValidating && !error && items.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 ">
                {items.map(({ id: itemId, name, media_gallery = [], tags = [], categories = [], excerpt = '', publish = false, feature_image = null, published_at = '' }, index) => (
                  <ListingCard key={index}>
                    <ListingCardImage src={feature_image ?? media_gallery?.[0]?.url ?? FALLBACK_IMAGE.src} alt={`${name} image`} />

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

                    <ListingCardContent>
                      <ListingCardTitle
                        actions={
                          <ListingCardActions
                            itemId={itemId}
                            editHref={`/dashboard/admin/blogs/${itemId}`}
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

                      {/* Categories  */}
                      {categories.length > 0 && (
                        <ul className="list-item">
                          {categories.map(({ category_name }, idx) => (
                            <li key={idx} className="text-muted-foreground text-sm flex items-center gap-2">
                              {category_name}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Display Tags */}
                      {tags.length > 0 && (
                        <ListingCardTags>
                          {tags.map(({ tag_name }, idx) => (
                            <Badge key={idx} className={`bg-weelp-sage-deep text-white hover:text-white hover:bg-weelp-sage-deep ${idx === 0 && 'bg-muted-foreground'}`}>
                              {tag_name}
                            </Badge>
                          ))}
                        </ListingCardTags>
                      )}

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <b>Status:</b>
                        {publish ? <Badge className={'bg-weelp-sage-deep'}>Published</Badge> : <Badge className={'bg-warning'}>Draft</Badge>}
                      </div>

                      {publish && <BlogPublishedDate date={published_at} className="text-sm text-muted-foreground" />}

                      {/* Excerpt */}
                      {excerpt && <p className="bg-card text-foreground text-sm text-wrap">{excerpt.concat('...')}</p>}
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

export default FilterBlog;
