'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import Pagination from '@/app/components/ui/Pagination';
import { useParams } from 'next/navigation';
import axios from 'axios';
import ItemCard from '@/app/components/ui/item-card';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import { ProductCardSkelton } from '@/app/components/Animation/Cards';

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
  const [itineraries, setItineraries] = useState([]);
  const [pagination, setPagination] = useState({ last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const sortRef = useRef(null);
  const sectionRef = useRef(null);

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    setTimeout(() => scrollToSection(), 50);
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

  // Fetch itineraries from API
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
        .get(`/api/public/itineraries/featured?${query.toString()}`)
        .then((res) => {
          if (res.data?.success) {
            setItineraries(res.data.data || []);
            setAllTags(res.data.all_tags || []);
            setPagination({
              last_page: res.data.last_page || 1,
              total: res.data.total || 0,
            });
          }
        })
        .catch(() => {
          setItineraries([]);
          setAllTags([]);
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

  const cards = itineraries.map((item) => mapProductToItemCard(item, city));
  const totalPages = pagination.last_page;

  // Don't render section if initial load returns no itineraries and no tags
  if (!isLoading && itineraries.length === 0 && allTags.length === 0 && selectedTags.length === 0) return null;

  return (
    <section ref={sectionRef} className="mx-auto flex w-full max-w-[1480px] flex-col gap-8 px-4 sm:px-6 xl:px-0 py-[70px]">
      <h2 className="text-[28px] text-[#273f4e] capitalize" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
        {cityName} Tours
      </h2>

      <div className="flex flex-wrap items-center gap-4">
        {/* Featured Tags — Simple Box Design */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedTags([]);
              setCurrentPage(1);
            }}
            className="rounded-[7.86px] border px-4 py-2 text-[#435a67] transition"
            style={{
              backgroundColor: '#f2f2f2',
              borderColor: 'rgba(67, 90, 103, 0.26)',
              fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
              fontWeight: selectedTags.length === 0 ? 600 : 500,
              fontSize: '16px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f2f2f2')}
          >
            All
          </button>
          {allTags
            .filter((tag) => tag.is_featured === true)
            .map((tag) => {
              const isActive = selectedTags.includes(tag.name);
              return (
                <button
                  key={tag.id || tag.name}
                  type="button"
                  onClick={() => handleTagToggle(tag.name)}
                  className="rounded-[7.86px] border px-4 py-2 text-[#435a67] transition"
                  style={{
                    backgroundColor: '#f2f2f2',
                    borderColor: 'rgba(67, 90, 103, 0.26)',
                    fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '16px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f2f2f2')}
                >
                  {tag.name}
                </button>
              );
            })}
        </div>

        {/* Sort + View on Map — Always on right */}
        <div className="flex shrink-0 items-center gap-3 ml-auto">
          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setShowSortDropdown((prev) => !prev)}
              className="flex items-center gap-2 rounded-[7.86px] border px-4 py-2 text-[#435a67] transition"
              style={{
                backgroundColor: '#f2f2f2',
                borderColor: 'rgba(67, 90, 103, 0.26)',
                fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f2f2f2')}
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
            className="flex items-center gap-2 rounded-[7.86px] border px-4 py-2 text-[#435a67] transition"
            style={{
              backgroundColor: '#f2f2f2',
              borderColor: 'rgba(67, 90, 103, 0.26)',
              fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
              fontWeight: 500,
              fontSize: '16px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f2f2f2')}
          >
            <MapPin className="size-5" strokeWidth={1.2} />
            View on Map
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="flex gap-4 flex-wrap justify-center">
          {[...Array(6)].map((_, i) => (
            <ProductCardSkelton key={i} className="sm:max-w-xs w-full" />
          ))}
        </div>
      ) : cards.length > 0 ? (
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => (
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
      ) : (
        <div className="flex min-h-[220px] items-center justify-center">
          <span className="text-[16px] text-[#6b7b8d]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 500 }}>
            No itineraries found for the selected tags
          </span>
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </section>
  );
}
