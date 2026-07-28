'use client';
import React, { useEffect, useState } from 'react';
import { Frown, LoaderCircle, Search, X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { debounce } from 'lodash';
import { useCallback } from 'react';
import { useBlogs } from '@/hooks/api/public/blogs/useBlogs';
import { FALLBACK_IMAGE } from '@/constants/image';
import Link from 'next/link';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import MediaImage from '@/app/components/MediaImage';

const CREATOR_SEARCH_FIELD_CLASS = 'bg-card dark:bg-[var(--weelp-home-surface)]';
const CREATOR_SEARCH_ICON_CLASS = 'bg-weelp-sage-deep dark:bg-[var(--weelp-home-page)]';

export const SearchFormCreator = () => {
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [minLengthHint, setMinLengthHint] = useState('');

  const handleClickOutside = useCallback(() => {
    setShowDropdown(false);
  }, []);

  useEffect(() => {
    document.body.addEventListener('click', handleClickOutside);
    return () => {
      document.body.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { search: '' },
  });

  const getItemHref = (itinerary) => {
    const citySlug = itinerary?.locations?.[0]?.city?.slug;
    const slug = itinerary?.slug;
    const creatorId = itinerary?.creator?.id;

    if (!citySlug || !slug) return '#';

    return `/cities/${citySlug}/itineraries/${slug}${creatorId ? `?ref=${creatorId}` : ''}`;
  };

  const getFeaturedImage = (itinerary) => {
    const featuredMedia = itinerary?.media_gallery?.find((media) => media.is_featured)?.media?.url || itinerary?.media_gallery?.[0]?.media?.url;
    return featuredMedia || itinerary?.featured_image || '/assets/Card.webp';
  };

  const onSubmit = async (data) => {
    const query = data.search?.trim() || '';

    if (query.length === 0) {
      setResults([]);
      setMessage('');
      setMinLengthHint('');
      setShowDropdown(false);
      return;
    }

    if (query.length < 3) {
      setResults([]);
      setMessage('');
      setMinLengthHint('Minimum 3 characters required');
      setShowDropdown(false);
      return;
    }

    setMinLengthHint('');

    try {
      const res = await fetch(`/api/search/creator?search=${encodeURIComponent(query)}`);
      const { itineraries } = await res.json();

      if (itineraries && itineraries.length > 0) {
        setResults(itineraries);
        setMessage('');
      } else {
        setResults([]);
        setMessage('No results found');
      }
      setShowDropdown(true);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setMessage('No results found');
      setShowDropdown(true);
    }
  };

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    if (!val || val.trim().length === 0) {
      setResults([]);
      setMessage('');
      setMinLengthHint('');
      setShowDropdown(false);
    }
  }, []);

  const { onChange: registerOnChange, ...registerRest } = register('search');

  return (
    <div className="flex flex-col max-w-[30rem] w-full mx-auto relative">
      <form
        onKeyUp={debounce(handleSubmit(onSubmit), 600)}
        className={`flex min-h-14 w-full items-center gap-3 rounded-xl border border-border ${CREATOR_SEARCH_FIELD_CLASS} px-3 py-2 shadow-[0_3px_9px_rgba(0,0,0,0.04)] dark:shadow-none`}
      >
        <input
          id="search"
          autoComplete="off"
          type="text"
          {...registerRest}
          onChange={(e) => {
            registerOnChange(e);
            handleInputChange(e);
          }}
          placeholder="Search creator itineraries..."
          className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
        />
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${CREATOR_SEARCH_ICON_CLASS} text-white shadow-[0_3px_9px_rgba(0,0,0,0.04)]`}>
          {isSubmitting ? <LoaderCircle size={16} className="animate-spin duration-1000" /> : <Search size={16} />}
        </div>
      </form>

      {minLengthHint && <span className="absolute left-0 top-full mt-1 flex items-center gap-1 mx-4 p-1.5 text-[0.7em] text-red-400 z-[90]">{minLengthHint}</span>}

      <div className="absolute left-0 right-0 top-full mt-1 z-[90]">
        {showDropdown && (
          <div>
            {results.length > 0 ? (
              <ul className="bg-background w-full rounded-md flex flex-col gap-1 max-h-64 h-fit shadow-md overflow-y-auto tfc_scroll">
                {results.map((itinerary) => (
                  <li key={itinerary.id}>
                    <Link href={getItemHref(itinerary)} onClick={() => setShowDropdown(false)} className="hover:bg-muted flex items-center gap-3 py-2.5 px-4 hover:cursor-pointer">
                      <img src={getFeaturedImage(itinerary)} className="size-10 rounded-md object-cover shrink-0" alt="itinerary thumbnail" width={40} height={40} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{itinerary?.name || 'Untitled itinerary'}</p>
                        <p className="text-xs text-muted-foreground truncate">by {itinerary?.creator?.name || 'Unknown creator'}</p>
                      </div>
                      {itinerary?.creator?.avatar_media?.url || itinerary?.creator?.profile?.avatar ? (
                        <img
                          src={itinerary?.creator?.avatar_media?.url || itinerary?.creator?.profile?.avatar}
                          className="size-7 rounded-full object-cover shrink-0"
                          alt="creator avatar"
                          width={28}
                          height={28}
                        />
                      ) : (
                        <img src="/assets/Card.webp" className="size-7 rounded-full object-cover shrink-0" alt="creator avatar" width={28} height={28} />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              message && (
                <div className="hover:bg-weelp-steel flex justify-between rounded-md items-center py-2 px-6 hover:text-white hover:cursor-not-allowed bg-background shadow-md">
                  Sorry No Result Found
                  <Frown size={24} className="animate-pulse" />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Search Form For Blogs
export const SearchFormBlogs = () => {
  const [search, setSearch] = useState('');

  // Using react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      search: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = (data) => {
    setSearch(data.search.trim());
  };

  const searchValue = useWatch({ control, name: 'search' });
  const clearSearch = () => {
    setValue('search', '');
    setSearch('');
  };

  const { blogs, isValidating, error } = useBlogs(search ? { search } : {});

  const searchedBlogs = (search && blogs?.data) || [];

  return (
    <div className="flex flex-col max-w-[30rem] w-full mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className={`w-full bg-background border  flex items-center justify-evenly rounded-xl shadow ${errors?.search?.message ? 'border-red-400 border' : null}`}>
        <input
          id="search"
          aria-label="Search blogs"
          autoComplete="off"
          type="text"
          {...register('search', {
            required: 'Field Required',
            minLength: { value: 3, message: 'Minimum 3 characters required' },
            onChange: (event) => {
              if (!event.target.value) setSearch('');
            },
          })}
          placeholder={'What`s your want to read ?'}
          className="min-w-0 flex-1 p-4 focus-visible:outline-none placeholder:text-weelp-steel"
        />
        {searchValue && (
          <button type="button" aria-label="Clear blog search" onClick={clearSearch} className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg">
            <X size={16} />
          </button>
        )}
        <button type="submit" aria-label="Search blogs" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg">
          {isSubmitting || isValidating ? <LoaderCircle size={16} className="animate-spin duration-1000" /> : <Search size={16} />}
        </button>
      </form>

      <span role="alert" className={`${errors?.search?.message ? 'flex' : 'hidden'} items-center  gap-1 mx-4 p-2 text-base text-red-400 `}>
        <b>Error: </b> {errors?.search?.message}
      </span>

      <div className="relative" aria-live="polite">
        <div>
          {/* Error state */}
          {error && <span className="text-red-500">Something went wrong</span>}

          {/* Success with data */}
          {!error && !isValidating && searchedBlogs.length > 0 && (
            <ul className="absolute z-10 top-4 bg-background w-full rounded-md flex flex-col gap-2 max-h-52 shadow-md overflow-y-auto tfc_scroll">
              {searchedBlogs.map((val) => (
                <li key={val.id || val.slug}>
                  <NavigationLink href={`/blogs/${val?.slug}`} className="hover:bg-weelp-steel flex min-h-11 items-center justify-between gap-3 px-4 py-2 hover:cursor-pointer hover:text-white">
                    {val?.name}
                    <MediaImage alt="" src={val?.media_gallery?.[0]?.url ?? FALLBACK_IMAGE.src} width={36} height={36} sizes="36px" className="size-9 shrink-0 rounded-full object-cover" />
                  </NavigationLink>
                </li>
              ))}
            </ul>
          )}

          {/* No result */}
          {search && !error && !isValidating && searchedBlogs.length === 0 && (
            <div className="hover:bg-weelp-steel flex justify-between rounded-md items-center py-2 px-6 hover:text-white bg-background mt-2">
              Sorry No Result Found
              <Frown size={24} className="animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
