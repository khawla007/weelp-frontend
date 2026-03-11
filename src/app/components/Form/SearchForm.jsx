'use client';
import React, { useEffect, useState } from 'react';
import { Crosshair, Frown, LoaderCircle, Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { delay } from '@/lib/utils';
import Image from 'next/image';
import { debounce } from 'lodash';
import { useBlogs } from '@/hooks/api/public/blogs/useBlogs';
import { FALLBACK_IMAGE } from '@/constants/image';
import Link from 'next/link';

export const SearchFormCreator = () => {
  const [response, setResponse] = useState({
    message: '',
    data: [], // Default to an empty array, not string
  });

  // Initialize form once - setup click outside handler
  useEffect(() => {
    const handleClickOutside = () => {
      setResponse({ data: [] });
    };

    document.body.addEventListener('click', handleClickOutside);

    // Cleanup the event listener when the component unmounts
    return () => {
      document.body.removeEventListener('click', handleClickOutside);
    };
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
  });

  const onSubmit = async (data) => {
    try {
      await delay(1000); // Simulate delay
      const api = await fetch('/api/search/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const { message, items } = await api.json();

      // Set the response state with the items
      if (items && items.length > 0) {
        setResponse({
          message: message,
          data: items,
        });
      } else {
        setResponse({
          message: message,
          data: [],
        });
      }
    } catch (error) {
      console.log('Request failed:', error);
    }
  };

  return (
      <div className="flex flex-col max-w-[30rem] w-full mx-auto">
        <form onKeyUp={handleSubmit(onSubmit)} className={`w-full bg-white flex items-center justify-evenly rounded shadow ${errors?.search?.message ? 'border-red-400 border' : null}`}>
          <input
            id="search"
            autoComplete="off"
            type="text"
            {...register('search', {
              required: 'Field Required',
              minLength: { value: 3, message: 'Minimum 3 characters required' },
            })}
            placeholder={'What`s on your Bucket list?'}
            className="w-10/12 p-4 focus-visible:outline-none placeholder:text-grayDark"
          />
          <div>{isSubmitting ? <LoaderCircle size={16} className="animate-spin duration-1000" /> : <Search size={16} />}</div>
        </form>

        <span className={`${errors?.search?.message ? 'flex' : 'hidden'} items-center  gap-1 mx-4 p-2 text-base text-red-400 `}>
          <b>Error: </b> {errors?.search?.message}
        </span>

        <div className="relative">
          {response.message && response.data && (
            <div>
              {response.data.length > 0 ? (
                <ul className="absolute z-10 top-4 bg-white w-full rounded-md flex flex-col gap-2 max-h-52 h-fit shadow-md overflow-y-auto tfc_scroll">
                  {response.data.map((val, index) => (
                    <li key={index} className="hover:bg-grayDark flex justify-between items-center py-2 px-6 hover:text-white hover:cursor-pointer">
                      {val?.name}
                      <Image src={val?.image} className="size-9 rounded-full" alt="search_images" width={36} height={36} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="hover:bg-grayDark  flex justify-between rounded-md items-center py-2 px-6 hover:text-white hover:cursor-not-allowed bg-white mt-2">
                  Sorry No Result Found
                  <Frown size={24} className="animate-pulse" />
                </div>
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
