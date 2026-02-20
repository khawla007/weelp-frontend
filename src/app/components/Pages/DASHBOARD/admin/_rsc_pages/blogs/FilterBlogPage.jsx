'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ellipsis, Plus, SquarePen, Star, Tag, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { Checkbox } from '@/components/ui/checkbox';
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
    formState: { isDirty },
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
  };

  const debouncedUpdate = useMemo(
    () =>
      debounce((newFilters) => {
        setDebouncedFilters(newFilters); // update filter after debounce
      }, 500),
    [],
  );

  // side effect for if fiilter change
  useEffect(() => {
    debouncedUpdate(filters);
    return () => debouncedUpdate.cancel();
  }, [filters, debouncedUpdate]);

  // Memoized query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (debouncedFilters.search) params.append('search', debouncedFilters.search);
    if (debouncedFilters.category) params.append('category', debouncedFilters.category);
    if (debouncedFilters.tag) params.append('tag', debouncedFilters.tag);
    if (debouncedFilters.sort_by) params.append('sort_by', debouncedFilters.sort_by);
    if (debouncedFilters.page) params.append('page', debouncedFilters.page);

    return params.toString();
  }, [debouncedFilters]);

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
          <Controller
            name="search"
            control={control}
            render={({ field }) => <Input type="search" placeholder="Search Blogs" className="w-full bg-white focus-visible:ring-secondaryDark" {...field} />}
          />
        </div>

        {/* Reset Fields */}
        {isDirty && (
          <Button variant="destructive" type="button" onClick={() => reset()}>
            Reset{' '}
          </Button>
        )}
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
              // Seleted Items Functionality
              <p className="flex self-end gap-4">
                <Button variant="destructive" className="w-fit self-end" onClick={handleMultpleDelete}>
                  <Trash2 size={16} /> Delete
                </Button>
              </p>
            ) : (
              <Button asChild>
                <Link className="w-fit self-end bg-secondaryDark text-black" href="/dashboard/admin/blogs/new">
                  {/** Create New itineraries */}
                  <Plus size={16} /> Create Blog
                </Link>
              </Button>
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
                {items.map(({ id: itemId, name, media_gallery = [], tags = [], categories = [], excerpt = '', publish = false }, index) => (
                  <Card
                    key={index}
                    className={`group hover:shadow-md ease duration-300 rounded-lg w-full lg:w-fit border relative ${selectedItems?.includes(itemId) && 'p-3 border border-secondaryDark'}`}
                  >
                    <img className="w-full lg:w-[326px] h-[183px] rounded-lg aspect-square" src={media_gallery?.[0]?.url ?? FALLBACK_IMAGE.src} alt="activity_image" />

                    <div className=" bg-white p-4 space-y-2">
                      <h2>{name}</h2>

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

                    {/*  DropDown */}
                    <div className="absolute right-4 top-4">
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
                          <Button variant="outline">
                            <Ellipsis size={16} />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="space-y-0 -ml-20">
                          <DropdownMenuItem className="py-0">
                            <Button asChild variant="outline" className="w-full px-2 border-none flex justify-start text-sm font-normal">
                              <Link href={`/dashboard/admin/blogs/${itemId}`}>
                                <SquarePen size={16} className="mr-2" />
                                Edit
                              </Link>
                            </Button>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="py-0"
                            onSelect={(e) => {
                              e.preventDefault();
                              handleDeleteClick(itemId);
                            }}
                          >
                            <Button variant="outline" className="w-full px-2 text-red-400 border-none flex justify-start text-sm font-normal">
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </Button>
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

                    {/* Selected Items Input Field */}
                    <div className="absolute top-[5%] left-[5%] w-fit">
                      <Checkbox
                        checked={selectedItems.includes(itemId)}
                        className="data-[state=checked]:bg-secondaryDark"
                        onClick={(e) => {
                          setSelectedItems(
                            (prev) =>
                              prev.includes(itemId)
                                ? prev.filter((id) => id !== itemId) //
                                : [...prev, itemId], //
                          );
                        }}
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
