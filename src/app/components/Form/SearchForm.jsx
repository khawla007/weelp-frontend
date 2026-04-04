'use client';
import React, { useEffect, useState } from 'react';
import { Frown, LoaderCircle, Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { debounce } from 'lodash';
import { useCallback } from 'react';
import { useBlogs } from '@/hooks/api/public/blogs/useBlogs';
import { FALLBACK_IMAGE } from '@/constants/image';
import Link from 'next/link';

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

  const getItemHref = (post) => {
    const item = post?.tagged_items?.[0];
    if (!item?.taggable) return '#';
    const slug = item.taggable.slug;
    const type = item.taggable_type;
    const citySlug = item.taggable.locations?.[0]?.city?.slug;
    const creatorId = post?.creator?.id;

    if (!citySlug) return '#';

    if (type === 'App\\Models\\Activity') return `/cities/${citySlug}/activities/${slug}?ref=${creatorId}`;
    if (type === 'App\\Models\\Itinerary') return `/cities/${citySlug}/itineraries/${slug}?ref=${creatorId}`;
    if (type === 'App\\Models\\Package') return `/cities/${citySlug}/packages/${slug}?ref=${creatorId}`;
    return '#';
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
      const { posts } = await res.json();

      if (posts && posts.length > 0) {
        setResults(posts);
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

  const handleInputChange = useCallback(
    (e) => {
      const val = e.target.value;
      if (!val || val.trim().length === 0) {
        setResults([]);
        setMessage('');
        setMinLengthHint('');
        setShowDropdown(false);
      }
    },
    [],
  );

  const { onChange: registerOnChange, ...registerRest } = register('search');

  return (
    <div className="flex flex-col max-w-[30rem] w-full mx-auto">
      <form onKeyUp={debounce(handleSubmit(onSubmit), 600)} className="w-full bg-white flex items-center justify-evenly rounded shadow">
        <input
          id="search"
          autoComplete="off"
          type="text"
          {...registerRest}
          onChange={(e) => {
            registerOnChange(e);
            handleInputChange(e);
          }}
          placeholder="Search posts or creators..."
          className="w-10/12 p-4 focus-visible:outline-none placeholder:text-grayDark"
        />
        <div>{isSubmitting ? <LoaderCircle size={16} className="animate-spin duration-1000" /> : <Search size={16} />}</div>
      </form>

      {minLengthHint && (
        <span className="flex items-center gap-1 mx-4 p-1.5 text-[0.7em] text-red-400">
          {minLengthHint}
        </span>
      )}

      <div className="relative">
        {showDropdown && (
          <div>
            {results.length > 0 ? (
              <ul className="absolute z-10 top-4 bg-white w-full rounded-md flex flex-col gap-1 max-h-64 h-fit shadow-md overflow-y-auto tfc_scroll">
                {results.map((post) => (
                  <li key={post.id}>
                    <Link href={getItemHref(post)} onClick={() => setShowDropdown(false)} className="hover:bg-gray-50 flex items-center gap-3 py-2.5 px-4 hover:cursor-pointer">
                      <img src={post?.media?.url || '/assets/Card.webp'} className="size-10 rounded-md object-cover shrink-0" alt="post thumbnail" width={40} height={40} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{post?.caption || 'Untitled post'}</p>
                        <p className="text-xs text-gray-500 truncate">by {post?.creator?.name || 'Unknown creator'}</p>
                      </div>
                      {post?.creator?.avatar_media?.url ? (
                        <img src={post.creator.avatar_media.url} className="size-7 rounded-full object-cover shrink-0" alt="creator avatar" width={28} height={28} />
                      ) : (
                        <img src="/assets/Card.webp" className="size-7 rounded-full object-cover shrink-0" alt="creator avatar" width={28} height={28} />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              message && (
                <div className="hover:bg-grayDark flex justify-between rounded-md items-center py-2 px-6 hover:text-white hover:cursor-not-allowed bg-white mt-2">
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

  // Initialize form once - empty effect as all logic is inline
  useEffect(() => {
    // Placeholder for any future initialization
  }, []);

  // Using react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      search: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = async (data) => {
    // console.log('debouced search', data);
    setSearch(data);
  };

  const query = new URLSearchParams(search);

  const { blogs, isValidating, error } = useBlogs(query.size > 0 ? `?${query.toString()}` : '');

  const searchedBlogs = (query.size > 0 && blogs?.data) || [];

  return (
    <div className="flex flex-col max-w-[30rem] w-full mx-auto">
      <form
        onKeyUp={debounce(handleSubmit(onSubmit), 1000)}
        className={`w-full bg-white border  flex items-center justify-evenly rounded-xl shadow ${errors?.search?.message ? 'border-red-400 border' : null}`}
      >
        <input
          id="search"
          autoComplete="off"
          type="text"
          {...register('search', {
            required: 'Field Required',
            minLength: { value: 3, message: 'Minimum 3 characters required' },
          })}
          placeholder={'What`s your want to read ?'}
          className="w-10/12 p-4 focus-visible:outline-none placeholder:text-grayDark"
        />
        <div>{isSubmitting ? <LoaderCircle size={16} className="animate-spin duration-1000" /> : <X size={16} />}</div>
      </form>

      <span className={`${errors?.search?.message ? 'flex' : 'hidden'} items-center  gap-1 mx-4 p-2 text-base text-red-400 `}>
        <b>Error: </b> {errors?.search?.message}
      </span>

      <div className="relative">
        <div>
          {/* Error state */}
          {error && <span className="text-red-500">Something went wrong</span>}

          {/* Success with data */}
          {!error && !isValidating && searchedBlogs.length > 0 && (
            <ul className="absolute z-10 top-4 bg-white w-full rounded-md flex flex-col gap-2 max-h-52 shadow-md overflow-y-auto tfc_scroll">
              {searchedBlogs.map((val, index) => (
                <li key={index}>
                  <Link href={`/blogs/${val?.slug}`} className="hover:bg-grayDark flex justify-between items-center py-2 px-6 hover:text-white hover:cursor-pointer">
                    {val?.name}
                    <img alt="logo" src={val?.media_gallery?.[0]?.url ?? FALLBACK_IMAGE.src} className="size-9 rounded-full" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* No result */}
          {query.size > 0 && !error && !isValidating && searchedBlogs.length === 0 && (
            <div className="hover:bg-grayDark flex justify-between rounded-md items-center py-2 px-6 hover:text-white bg-white mt-2">
              Sorry No Result Found
              <Frown size={24} className="animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
