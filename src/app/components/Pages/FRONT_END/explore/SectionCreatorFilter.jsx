'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CreatorCard } from '@/app/components/CreatorCard';
import { Menu, ChevronDown, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';

const NAV_TABS = ['Home', 'Explore', 'Create'];

const CreatorFilter = ({ initialPosts, lastPage, onCreateClick }) => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState(initialPosts || []);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(lastPage || 1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const observerRef = useRef(null);
  const isAuthenticated = !!session?.user;

  const loadMorePosts = useCallback(async () => {
    if (loading || page >= maxPage) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/public/posts?page=${nextPage}`);
      const data = await res.json();

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
  }, [loading, page, maxPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
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

  return (
    <section className="relative max-w-[95%] mx-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center flex-col sm:flex-row px-6">
        {/* Top Rated Button */}
        <div className="mt-4">
          <button className="flex items-center gap-2 bg-transparent border border-[#435a6742] rounded-[8px] px-4 py-2 text-[17px] font-medium text-[#435a67]">
            Top Rated
            <ChevronDown size={16} />
          </button>
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

        {/* Filters Button */}
        <div className="mt-4">
          <button className="flex items-center justify-center gap-3 text-[17px] font-medium text-[#435a67] border border-[#435a6742] rounded-[7.86px] w-[114px] h-[38px]">
            Filters
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex flex-col gap-4 py-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-grayDark">
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm mt-2">Be the first creator to share your travel experience!</p>
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
            {loading && (
              <div className="w-8 h-8 border-2 border-secondaryDark border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CreatorFilter;
