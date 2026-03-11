'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ellipsis, Plus, SquarePen, Star, Tag, Trash2 } from 'lucide-react';
import debounce from 'lodash.debounce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import 'react-range-slider-input/dist/style.css';
import { CustomPagination } from '@/app/components/Pagination';
import Link from 'next/link';
import useSWR from 'swr'; // for states cache and ui management
import { fetcher } from '@/lib/fetchers'; // interceptors
import { useToast } from '@/hooks/use-toast';
import { SelectableCardCheckbox } from '@/app/components/Checkbox/SelectableCardCheckbox';
import { BulkActionButtons } from '@/app/components/BulkActions/BulkActionButtons';
import { AddNewButton } from '@/app/components/Button/AddNewButton';
import { DashboardSearch } from '@/app/components/DashboardShared';
import { deleteBlog, deleteMultipleBlogs } from '@/lib/actions/blogs';
import { useAlltagsOptionsAdmin } from '@/hooks/api/admin/tags';
import { useAllCategoriesOptionsAdmin } from '@/hooks/api/admin/categories';
import { FALLBACK_IMAGE } from '@/constants/image';

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

  const {
    register,
    setValue,
    control,
    reset,
  } = useForm({
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
      setSelectedItems(items.map(item => item.id));
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
  }, [
    filters.search,
    filters.category,
    filters.tag,
    filters.sort_by,
    debouncedUpdate,
  ]);

  // Reset page to 1 when any filter other than page changes
  useEffect(() => {
    setValue('page', 1);
  }, [
    filters.search,
    filters.category,
    filters.tag,
    filters.sort_by,
    setValue,
  ]);

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

        <Accordion type="single" collapsible>
          {/* Category */}

          <AccordionItem value="category">
            <AccordionTrigger>
              <p className="flex items-center gap-4">
                <Tag size={18} /> Categories
              </p>
            </AccordionTrigger>
            <AccordionContent>
              {/* STATUS MESSAGE */}
              {isCategoriesLoading && <span className="loader" />}

              {!isCategoriesLoading && categoriesOptionError && (
                <span className="text-sm text-red-500">{categoriesOptionError?.message || `Failed to load categories <br> ${JSON.stringify(categoriesOptionError)}`}</span>
              )}
              {!isCategoriesLoading && !categoriesOptionError && categoriesList.length === 0 && <span className="text-sm text-gray-500">No categories found</span>}

              {!isCategoriesLoading && categoriesList.length > 0 && (
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="focus:ring-0">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categoriesList.map((category, i) => (
                            <SelectItem key={i} value={category.slug}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </AccordionContent>
          </AccordionItem>

          {/* tags */}
          <AccordionItem value="tags">
            <AccordionTrigger>
              <p className="flex items-center gap-4">
                <Star size={18} /> Tags
              </p>
            </AccordionTrigger>
            <AccordionContent>
              {/* STATUS MESSAGE */}
              {isTagLoading && <span className="loader" />}

              {!isTagLoading && tagOptionsError && <span className="text-sm text-red-500">{tagOptionsError?.message || `Failed to load categories <br> ${JSON.stringify(tagOptionsError)}`}</span>}
              {!isTagLoading && !tagOptionsError && categoriesList.length === 0 && <span className="text-sm text-gray-500">No categories found</span>}

              {!isTagLoading && categoriesList.length > 0 && (
                <Controller
                  name="tag"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="focus:ring-0">
                        <SelectValue placeholder="Select a tags" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {tagList.map((tag, i) => (
                            <SelectItem key={i} value={tag?.slug}>
                              {tag?.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Filtered Items Output */}
      <div className="lg:w-3/4 p-4 space-y-4">
        {/* Sidebar */}
        <div className="flex justify-start lg:justify-between flex-wrap">
          Recommended
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
              <AddNewButton
                label="Add New"
                href="/dashboard/admin/blogs/new"
              />
            )}

            {/* Recommended */}
            <Controller
              name="sort_by"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Recommended" />
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
                {items.map(({ id: itemId, name, media_gallery = [], tags = [], categories = [], excerpt = '', publish = false, feature_image = null }, index) => (
                  <Card
                    key={index}
                    className="group hover:shadow-md rounded-lg w-full lg:w-fit border relative overflow-hidden"
                  >
                    <img className="w-full lg:w-[326px] h-[183px] rounded-t-lg rounded-b-none" src={feature_image ?? media_gallery?.[0]?.url ?? FALLBACK_IMAGE.src} alt="activity_image" />

                    <div className=" bg-white p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h2 className="m-0">{name}</h2>

                        {/* DropDown */}
                        <DropdownMenu
                          open={modalState.openDropdownIndex === itemId}
                          onOpenChange={(open) => {
                            setModalState((prev) => ({
                              ...prev,
                              openDropdownIndex: open ? itemId : '',
                            }));
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <Ellipsis size={16} />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/blogs/${itemId}`} className="flex items-center gap-2 cursor-pointer">
                                <SquarePen size={14} /> Edit
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                handleDeleteClick(itemId);
                              }}
                              className="text-red-400 cursor-pointer"
                            >
                              <Trash2 size={14} /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialog
                          open={modalState.openDialogIndex === itemId}
                          onOpenChange={(open) => {
                            if (!open) closeDialog();
                          }}
                        >
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone. This will permanently delete your data from our servers.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-dangerSecondary" onClick={() => handleDelete(itemId)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {/* Categories  */}
                      {categories.length > 0 && (
                        <ul className="list-item">
                          {categories.map(({ category_name }, index) => (
                            <li key={index} className="text-gray-500 text-sm flex items-center gap-2">
                              {category_name}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Display Tags */}
                      {tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {tags.map(({ tag_name }, index) => (
                            <Badge key={index} className={`bg-secondaryDark text-white hover:text-white hover:bg-secondaryDark ${index === 0 && 'bg-gray-400'}`}>
                              {tag_name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Status */}
                      <b>Status:</b>
                      {publish ? <Badge className={'bg-secondaryDark'}>Published</Badge> : <Badge className={'bg-yellow-400'}>Draft</Badge>}
                      {/* Excerpt */}
                      {excerpt ? <p className=" bg-card text-foreground text-sm text-wrap">{excerpt.concat('...')}</p> : null}
                    </div>

                    {/* Selected Items Input Field */}
                    <div className="absolute top-4 left-4 w-fit">
                      <SelectableCardCheckbox
                        checked={selectedItems.includes(itemId)}
                        onCheckedChange={(checked, id) => {
                          setSelectedItems(prev => {
                            const newSelection = checked
                              ? [...prev, id]
                              : prev.filter(itemId => itemId !== id);
                            setIsAllSelected(newSelection.length === items.length);
                            return newSelection;
                          });
                        }}
                        itemId={itemId}
                      />
                    </div>
                  </Card>
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
