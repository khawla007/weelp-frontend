'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import Pagination from '@/app/components/ui/Pagination';
import { useParams } from 'next/navigation';
import axios from 'axios';
import ItemCard from '@/app/components/ui/item-card';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import { LoadingPage } from '@/app/components/Animation/Cards';

const SORT_OPTIONS = [
  { value: 'id_desc', label: 'Newest First' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function CityToursSection({ cityName }) {
  const { city } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('id_desc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [packages, setPackages] = useState([]);
  const [pagination, setPagination] = useState({ last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const sortRef = useRef(null);
  const tagScrollRef = useRef(null);
  const sectionRef = useRef(null);

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    setTimeout(() => scrollToSection(), 50);
  };

  const scrollTags = (direction) => {
    if (!tagScrollRef.current) return;
    tagScrollRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch packages from API
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      const query = new URLSearchParams();
      query.set('page', currentPage);
      query.set('per_page', '8');
      if (selectedTags.length > 0) query.set('tags', selectedTags.join(','));
      if (sortBy) query.set('sort_by', sortBy);

      query.set('city', city);

      axios
        .get(`/api/public/packages/featured?${query.toString()}`)
        .then((res) => {
          if (res.data?.success) {
            setPackages(res.data.data || []);
            setAllTags(res.data.all_tags || []);
            setPagination({
              last_page: res.data.last_page || 1,
              total: res.data.total || 0,
            });
          }
        })
        .catch(() => {
          setPackages([]);
          setPagination({ last_page: 1, total: 0 });
        })
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [city, currentPage, selectedTags, sortBy]);

  const handleTagToggle = (tagName) => {
    setCurrentPage(1);
    setSelectedTags((prev) => (prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]));
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
    setShowSortDropdown(false);
  };

  const cards = packages.map((item) => mapProductToItemCard(item, city));
  const totalPages = pagination.last_page;

  // Don't render section if initial load returns no packages and no tags
  if (!isLoading && packages.length === 0 && allTags.length === 0 && selectedTags.length === 0) return null;

  return (
    <section ref={sectionRef} className="mx-auto flex w-full max-w-[1480px] flex-col gap-8 px-4 sm:px-6 xl:px-0 py-[70px]">
      <h2 className="text-[28px] text-[#273f4e] capitalize" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
        {cityName} Tours
      </h2>

      <div className="flex items-center justify-between">
        {/* Tag Scroller */}
        <div className="flex min-w-0 max-w-[700px] flex-1 items-center overflow-hidden rounded-[7.86px] border" style={{ borderColor: 'rgba(67, 90, 103, 0.26)' }}>
          <span
            className="shrink-0 border-r px-4 py-2 text-[#435a67]"
            style={{
              borderColor: 'rgba(67, 90, 103, 0.16)',
              fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
            }}
          >
            Tags
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedTags([]);
              setCurrentPage(1);
            }}
            className={`weelp-city-tab ml-2 shrink-0 rounded-full px-[14px] py-[4px] transition-all ${selectedTags.length === 0 ? 'weelp-city-tab-active' : 'hover:border-[var(--weelp-city-tab-active-border)]'}`}
            style={{
              fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
              fontWeight: selectedTags.length === 0 ? 600 : 500,
              fontSize: '13px',
            }}
          >
            All
          </button>
          <button type="button" onClick={() => scrollTags('left')} className="shrink-0 px-1 text-[#435a67] transition hover:text-[#273f4e]" aria-label="Scroll tags left">
            <ChevronLeft className="size-4" />
          </button>
          <div ref={tagScrollRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {allTags.map((tag) => {
              const isActive = selectedTags.includes(tag.name);
              return (
                <button
                  key={tag.id || tag.name}
                  type="button"
                  onClick={() => handleTagToggle(tag.name)}
                  className={`weelp-city-tab shrink-0 rounded-full px-[14px] py-[4px] transition-all ${isActive ? 'weelp-city-tab-active' : 'hover:border-[var(--weelp-city-tab-active-border)]'}`}
                  style={{
                    fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '13px',
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => scrollTags('right')} className="shrink-0 px-1 text-[#435a67] transition hover:text-[#273f4e]" aria-label="Scroll tags right">
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Sort + View on Map */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setShowSortDropdown((prev) => !prev)}
              className="flex items-center gap-2 rounded-[7.86px] border px-4 py-2 text-[#435a67] transition hover:bg-gray-50"
              style={{
                borderColor: 'rgba(67, 90, 103, 0.26)',
                fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
              }}
            >
              Sort
              <ChevronDown className="size-4" />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full z-10 mt-1 min-w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSortChange(option.value)}
                    className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-50 ${sortBy === option.value ? 'font-semibold text-[#273f4e]' : 'text-[#435a67]'}`}
                    style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View on Map — static */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-[7.86px] border px-4 py-2 text-[#435a67] transition hover:bg-gray-50"
            style={{
              borderColor: 'rgba(67, 90, 103, 0.26)',
              fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
              fontWeight: 500,
              fontSize: '16px',
            }}
          >
            <MapPin className="size-5" strokeWidth={1.2} />
            View on Map
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && <LoadingPage />}

      {/* Cards Grid */}
      <div className={`grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4 ${isLoading ? 'opacity-50' : ''}`}>
        {!isLoading &&
          cards.map((card, index) => (
            <ItemCard
              key={card.id || `${card.href}-${index}`}
              href={card.href}
              image={card.image}
              title={card.title}
              price={card.price}
              rating={card.rating}
              reviewCount={card.reviewCount}
              discount={card.discount}
              variant="full"
            />
          ))}
      </div>

      {/* Empty State */}
      {!isLoading && cards.length === 0 && (
        <div className="flex min-h-[220px] items-center justify-center">
          <span className="text-[16px] text-[#6b7b8d]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 500 }}>
            No packages found for the selected tags
          </span>
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </section>
  );
}
