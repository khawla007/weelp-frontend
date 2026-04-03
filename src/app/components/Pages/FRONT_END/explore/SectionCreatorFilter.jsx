'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CreatorCard } from '@/app/components/CreatorCard';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const NAV_TABS = ['Home', 'Explore', 'Create'];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'top_rated', label: 'Top Rated' },
];

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Posts' },
  { value: 'mine', label: 'My Posts' },
];

const CreatorFilter = ({ initialPosts, lastPage, onCreateClick }) => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState(initialPosts || []);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(lastPage || 1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [activeSort, setActiveSort] = useState('latest');
  const [activeSource, setActiveSource] = useState('all');
  const observerRef = useRef(null);
  const isInitialMount = useRef(true);
  const isAuthenticated = !!session?.user;

  const fetchPosts = useCallback(
    async (pageNum, sort, source) => {
      const params = new URLSearchParams({ page: pageNum, sort });
      if (source === 'mine') params.set('source', 'mine');

      const headers = { Accept: 'application/json' };
      if (source === 'mine' && session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/posts?${params.toString()}`, { headers });
      return res.json();
    },
    [session?.access_token],
  );

  // Refetch when filters change (skip initial mount — we have initialPosts)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    let cancelled = false;
    const refetch = async () => {
      setLoading(true);
      setPosts([]);
      try {
        const data = await fetchPosts(1, activeSort, activeSource);
        if (!cancelled) {
          setPosts(data?.data || []);
          setPage(1);
          setMaxPage(data?.last_page || 1);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    refetch();

    return () => {
      cancelled = true;
    };
  }, [activeSort, activeSource, fetchPosts]);

  const loadMorePosts = useCallback(async () => {
    if (loading || page >= maxPage) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await fetchPosts(nextPage, activeSort, activeSource);

      if (data?.data?.length > 0) {
        setPosts((prev) => [...prev, ...data.data]);
        setPage(nextPage);
        setMaxPage(data.last_page);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, page, maxPage, fetchPosts, activeSort, activeSource]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMorePosts]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'Create' && onCreateClick) {
      onCreateClick();
    }
  };

  const handleSourceChange = (value) => {
    if (value === 'mine' && !isAuthenticated) return;
    setActiveSource(value);
  };

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === activeSort)?.label;
  const activeSourceLabel = SOURCE_OPTIONS.find((o) => o.value === activeSource)?.label;

  return (
    <section className="relative max-w-[95%] mx-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center flex-col sm:flex-row px-6">
        {/* Sort Dropdown */}
        <div className="mt-[1.5rem]">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between gap-2 bg-transparent border border-[#435a6742] rounded-[8px] px-4 py-2 text-[17px] font-medium text-[#435a67] outline-none min-w-[160px]">
                {activeSortLabel}
                <ChevronDown size={16} className="shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem key={option.value} onClick={() => setActiveSort(option.value)} className="flex items-center justify-between gap-4 cursor-pointer">
                  {option.label}
                  {activeSort === option.value && <Check size={14} className="text-secondaryDark" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4">
          <ul className="flex items-center gap-[22px]">
            {NAV_TABS.map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => handleTabClick(tab)}
                  className="text-[18px] font-medium"
                  style={{
                    color: '#435a67',
                    padding: activeTab === tab ? '7px 21px' : '7px 0',
                    backgroundColor: activeTab === tab ? '#cfdbe54d' : 'transparent',
                    borderRadius: activeTab === tab ? '8.5px' : '0',
                  }}
                >
                  {tab === 'Create' && <Plus size={14} className="inline mr-1" />}
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Source Filter Dropdown */}
        <div className="mt-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between gap-2 bg-transparent border border-[#435a6742] rounded-[7.86px] px-4 py-2 text-[17px] font-medium text-[#435a67] outline-none min-w-[160px]">
                {activeSourceLabel}
                <ChevronDown size={16} className="shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              {SOURCE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSourceChange(option.value)}
                  disabled={option.value === 'mine' && !isAuthenticated}
                  className="flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {option.label}
                    {option.value === 'mine' && !isAuthenticated && <span className="text-xs text-gray-400">(Login required)</span>}
                  </span>
                  {activeSource === option.value && <Check size={14} className="text-secondaryDark" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex flex-col gap-4 py-6">
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-secondaryDark border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-grayDark">
            <p className="text-lg font-medium">{activeSource === 'mine' ? "You haven't created any posts yet" : 'No posts yet'}</p>
            <p className="text-sm mt-2">{activeSource === 'mine' ? 'Share your travel experiences with the community!' : 'Be the first creator to share your travel experience!'}</p>
          </div>
        ) : (
          <ul className="w-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {posts.map((post) => (
              <li key={post.id}>
                <CreatorCard post={post} isAuthenticated={isAuthenticated} />
              </li>
            ))}
          </ul>
        )}

        {/* Infinite scroll sentinel */}
        {page < maxPage && (
          <div ref={observerRef} className="flex justify-center py-4">
            {loading && <div className="w-8 h-8 border-2 border-secondaryDark border-t-transparent rounded-full animate-spin" />}
          </div>
        )}
      </div>
    </section>
  );
};

export default CreatorFilter;
