'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CreatorItineraryCard from './CreatorItineraryCard';
import { ChevronDown, Check, UserPlus, Sparkles, TrendingUp, Home, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getExploreItineraries } from '@/lib/services/creatorItineraries';

const CONTENT_TABS = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'top_rated', label: 'Top Rated' },
];

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Itineraries' },
  { value: 'mine', label: 'My Itineraries' },
];

function getActionButton(isLoggedIn, isCreator, applicationStatus, statusLoading) {
  if (!isLoggedIn) {
    return { label: 'Join as Creator', icon: UserPlus };
  }
  if (isCreator) return null;
  if (statusLoading) return null;
  if (applicationStatus === 'pending') {
    return { label: 'Pending', icon: Clock };
  }
  return { label: 'Apply as Creator', icon: Sparkles };
}

const CreatorFilter = ({ initialItineraries, lastPage, activeTab, onTabChange, onActionClick, isLoggedIn, isCreator, applicationStatus, statusLoading }) => {
  const { data: session } = useSession();
  const [itineraries, setItineraries] = useState(initialItineraries || []);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(lastPage || 1);
  const [loading, setLoading] = useState(false);
  const [activeSort, setActiveSort] = useState('latest');
  const [activeSource, setActiveSource] = useState('all');
  const observerRef = useRef(null);
  const isInitialMount = useRef(true);
  const isAuthenticated = !!session?.user;

  // Sort itineraries for trending: by total engagement (likes + views) descending
  const displayItineraries = useMemo(() => {
    if (activeTab !== 'trending') return itineraries;
    return [...itineraries].sort((a, b) => {
      const scoreA = (a.likes_count || 0) + (a.views_count || 0);
      const scoreB = (b.likes_count || 0) + (b.views_count || 0);
      return scoreB - scoreA;
    });
  }, [itineraries, activeTab]);

  const fetchItineraries = useCallback(
    (pageNum, sort, source) => getExploreItineraries(pageNum, sort, source === 'mine' ? 'mine' : null),
    [],
  );

  // Refetch when filters change (skip initial mount — we have initialItineraries)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip refetch when on trending tab — client handles sort
    if (activeTab === 'trending') return;

    let cancelled = false;
    const refetch = async () => {
      setLoading(true);
      setItineraries([]);
      try {
        const data = await fetchItineraries(1, activeSort, activeSource);
        if (!cancelled) {
          setItineraries(data?.data || []);
          setPage(1);
          setMaxPage(data?.last_page || 1);
        }
      } catch (error) {
        console.error('Error fetching itineraries:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    refetch();

    return () => {
      cancelled = true;
    };
  }, [activeSort, activeSource, fetchItineraries, activeTab]);

  const loadMoreItineraries = useCallback(async () => {
    // Disable infinite scroll on trending tab (client-side sort of existing data)
    if (activeTab === 'trending') return;
    if (loading || page >= maxPage) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await fetchItineraries(nextPage, activeSort, activeSource);

      if (data?.data?.length > 0) {
        setItineraries((prev) => [...prev, ...data.data]);
        setPage(nextPage);
        setMaxPage(data.last_page);
      }
    } catch (error) {
      console.error('Error loading more itineraries:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, page, maxPage, fetchItineraries, activeSort, activeSource, activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItineraries();
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreItineraries]);

  const handleSourceChange = (value) => {
    if (value === 'mine' && !isAuthenticated) return;
    setActiveSource(value);
  };

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === activeSort)?.label;
  const activeSourceLabel = SOURCE_OPTIONS.find((o) => o.value === activeSource)?.label;
  const actionBtn = getActionButton(isLoggedIn, isCreator, applicationStatus, statusLoading);
  const ActionIcon = actionBtn?.icon;

  return (
    <section className="relative max-w-[95%] mx-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center flex-col sm:flex-row px-6">
        {/* Sort Dropdown — hidden on Trending tab */}
        <div className="mt-[1.5rem]">
          {activeTab === 'home' ? (
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
          ) : (
            <div className="min-w-[160px]" />
          )}
        </div>

        {/* Content Tabs + Action Button */}
        <div className="mt-4 flex items-center gap-[22px]">
          {/* Home / Trending tabs */}
          {CONTENT_TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className="text-[18px] font-medium flex items-center gap-1.5"
                style={{
                  color: '#435a67',
                  padding: activeTab === tab.value ? '7px 21px' : '7px 0',
                  backgroundColor: activeTab === tab.value ? '#cfdbe54d' : 'transparent',
                  borderRadius: activeTab === tab.value ? '8.5px' : '0',
                }}
              >
                <TabIcon size={16} />
                {tab.label}
              </button>
            );
          })}

          {/* Divider + Dynamic Action Button */}
          {actionBtn && (
            <>
              <div className="w-px h-6 bg-[#435a6730]" />
              <button
                onClick={onActionClick}
                disabled={applicationStatus === 'pending'}
                className="flex items-center gap-1.5 text-[18px] font-medium text-white bg-secondaryDark hover:bg-secondaryDark/90 px-5 py-[7px] rounded-[8.5px] transition-colors disabled:opacity-60"
              >
                <ActionIcon size={16} />
                {actionBtn.label}
              </button>
            </>
          )}
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
        {loading && displayItineraries.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-secondaryDark border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayItineraries.length === 0 ? (
          <div className="text-center py-12 text-grayDark">
            <p className="text-lg font-medium">{activeSource === 'mine' ? "You haven't created any itineraries yet" : 'No itineraries yet'}</p>
            <p className="text-sm mt-2">{activeSource === 'mine' ? 'Share your travel experiences with the community!' : 'Be the first creator to share your travel experience!'}</p>
          </div>
        ) : (
          <ul className="w-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {displayItineraries.map((itinerary) => (
              <li key={itinerary.id}>
                <CreatorItineraryCard itinerary={itinerary} isLoggedIn={isAuthenticated} />
              </li>
            ))}
          </ul>
        )}

        {/* Infinite scroll sentinel — disabled on trending tab */}
        {activeTab === 'home' && page < maxPage && (
          <div ref={observerRef} className="flex justify-center py-4">
            {loading && <div className="w-8 h-8 border-2 border-secondaryDark border-t-transparent rounded-full animate-spin" />}
          </div>
        )}
      </div>
    </section>
  );
};

export default CreatorFilter;
