import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';

/**
 * Method is For Retrieving Public Blogs Using Proxy Api
 * @param {Object} params - Query parameters for filtering blogs
 * @returns {Promise<blogs,isLoading,isValidating,error,mutate>}
 */
export function useBlogs(params = {}) {
  const queryString =
    typeof params === 'string'
      ? params.replace(/^\?/, '')
      : new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))).toString();
  const url = queryString ? `/api/public/blogs?${queryString}` : `/api/public/blogs`;

  const { data = {}, error, isValidating, isLoading, mutate } = useSWR(url, fetcher);
  return {
    blogs: data?.data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
