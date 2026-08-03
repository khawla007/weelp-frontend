'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CreatorItineraryCard from './CreatorItineraryCard';
import Reveal from '@/app/components/ui/Reveal';
import SectionHeader from '@/app/components/ui/SectionHeader';
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

const CreatorFilter = ({ initialItineraries, lastPage, initialError = false, activeTab, onTabChange, onActionClick, isLoggedIn, isCreator, applicationStatus, statusLoading }) => {
  const { data: session } = useSession();
  const [itineraries, setItineraries] = useState(initialItineraries || []);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(lastPage || 1);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(initialError);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
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

  const fetchItineraries = useCallback((pageNum, sort, source) => getExploreItineraries(pageNum, sort, source === 'mine' ? 'mine' : null), []);

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
      setFetchError(false);
      setLoadMoreError(false);
      setItineraries([]);
      try {
        const data = await fetchItineraries(1, activeSort, activeSource);
        if (!cancelled) {
          if (data?.success === false) {
            setFetchError(true);
            setItineraries([]);
            setPage(1);
            setMaxPage(1);
            return;
          }
          setItineraries(data?.data || []);
          setPage(1);
          setMaxPage(data?.last_page || 1);
          setFetchError(false);
        }
      } catch (error) {
        console.error('Error fetching itineraries:', error);
        if (!cancelled) {
          setFetchError(true);
          setItineraries([]);
          setPage(1);
          setMaxPage(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    refetch();

    return () => {
      cancelled = true;
    };
  }, [activeSort, activeSource, fetchItineraries, activeTab, retryNonce]);

  const loadMoreItineraries = useCallback(
    async ({ manual = false } = {}) => {
      // Disable infinite scroll on trending tab (client-side sort of existing data)
      if (activeTab === 'trending') return;
      if (loadMoreError && !manual) return;
      if (loading || page >= maxPage) return;

      setLoading(true);
      setLoadMoreError(false);
      try {
        const nextPage = page + 1;
        const data = await fetchItineraries(nextPage, activeSort, activeSource);

        if (data?.success === false) {
          setLoadMoreError(true);
        } else if (data?.data?.length > 0) {
          setItineraries((prev) => [...prev, ...data.data]);
          setPage(nextPage);
          setMaxPage(data.last_page);
        }
      } catch (error) {
        console.error('Error loading more itineraries:', error);
        setLoadMoreError(true);
      } finally {
        setLoading(false);
      }
    },
    [loadMoreError, loading, page, maxPage, fetchItineraries, activeSort, activeSource, activeTab],
  );

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
    <section className="container-page relative flex flex-col gap-6 pb-10 md:gap-8 md:pb-16 lg:pb-24">
      <SectionHeader className="sr-only" title="Creator itineraries" />
      {/* Top Bar */}
      <Reveal variant="lift" className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        {/* Sort Dropdown — hidden on Trending tab */}
        <div className="mt-[1.5rem]">
          {activeTab === 'home' ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between gap-2 bg-transparent border border-border rounded-[8px] px-4 py-2 text-[16px] font-medium text-weelp-steel outline-none min-w-[160px]">
                  {activeSortLabel}
                  <ChevronDown size={16} className="shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[160px]">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => setActiveSort(option.value)} className="flex items-center justify-between gap-4 cursor-pointer">
                    {option.label}
                    {activeSort === option.value && <Check size={14} className="text-weelp-sage-text" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="min-w-[160px]" />
          )}
        </div>

        {/* Content Tabs + Action Button */}
        <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:flex-nowrap sm:gap-[22px]">
          {/* Home / Trending tabs */}
          {CONTENT_TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`flex min-h-11 items-center gap-1.5 py-[7px] text-sm font-medium sm:text-[18px] ${activeTab === tab.value || tab.value === 'trending' ? 'px-3 sm:px-[21px]' : 'px-0'}`}
                style={{
                  color: 'hsl(var(--weelp-steel))',
                  backgroundColor: activeTab === tab.value ? '#f2f7f5' : 'transparent',
                  borderRadius: activeTab === tab.value || tab.value === 'trending' ? '8.5px' : '0',
                }}
              >
                <TabIcon size={16} />
                {tab.label}
              </button>
            );
          })}

          {/* Dynamic Action Button */}
          {actionBtn && (
            <button
              onClick={onActionClick}
              disabled={applicationStatus === 'pending'}
              className="flex min-h-11 items-center gap-1.5 rounded-[8.5px] bg-weelp-sage-deep px-3 py-[7px] text-sm font-medium text-white transition-colors hover:bg-weelp-sage-deep/90 disabled:opacity-60 sm:px-5 sm:text-[18px]"
            >
              <ActionIcon size={16} />
              {actionBtn.label}
            </button>
          )}
        </div>

        {/* Source Filter Dropdown */}
        <div className="mt-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between gap-2 bg-transparent border border-border rounded-[7.86px] px-4 py-2 text-[16px] font-medium text-weelp-steel outline-none min-w-[160px]">
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
                    {option.value === 'mine' && !isAuthenticated && <span className="text-xs text-muted-foreground">(Login required)</span>}
                  </span>
                  {activeSource === option.value && <Check size={14} className="text-weelp-sage-text" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Reveal>

      {/* Results Section */}
      <div className="flex flex-col gap-6">
        {loading && displayItineraries.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-weelp-sage-deep border-t-transparent rounded-full animate-spin" />
          </div>
        ) : fetchError ? (
          <div data-testid="creator-itineraries-error" className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center text-weelp-steel">
            <p className="text-lg font-medium">We could not load creator itineraries.</p>
            <button
              type="button"
              onClick={() => {
                isInitialMount.current = false;
                setRetryNonce((value) => value + 1);
              }}
              className="inline-flex min-h-[44px] items-center rounded-[11.5px] border border-weelp-sage-deep bg-background px-5 py-2.5 text-[16px] font-medium text-weelp-copy transition-colors duration-200 hover:bg-weelp-sage-deep hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Try again
            </button>
          </div>
        ) : displayItineraries.length === 0 ? (
          <div className="text-center py-12 text-weelp-steel">
            <p className="text-lg font-medium">{activeSource === 'mine' ? "You haven't created any itineraries yet" : 'No itineraries yet'}</p>
            <p className="text-sm mt-2">{activeSource === 'mine' ? 'Share your travel experiences with the community!' : 'Be the first creator to share your travel experience!'}</p>
          </div>
        ) : (
          <Reveal as="ul" initialHidden stagger={60} variant="lift" className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6">
            {displayItineraries.map((itinerary) => (
              <li key={itinerary.id}>
                <CreatorItineraryCard itinerary={itinerary} isLoggedIn={isAuthenticated} />
              </li>
            ))}
          </Reveal>
        )}

        {/* Infinite scroll sentinel — disabled on trending tab */}
        {activeTab === 'home' && page < maxPage && (
          <div ref={observerRef} className="flex justify-center py-4">
            {loading && <div className="w-8 h-8 border-2 border-weelp-sage-deep border-t-transparent rounded-full animate-spin" />}
            {loadMoreError && !loading && (
              <button type="button" onClick={() => loadMoreItineraries({ manual: true })} className="text-sm font-medium text-weelp-copy underline underline-offset-4">
                Try loading more again
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CreatorFilter;
