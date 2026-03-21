'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import ItemCard from '@/app/components/ui/item-card';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import { LoadingPage } from '@/app/components/Animation/Cards';
import FilterSidebar from './FilterSidebar';
import CategoryTabs from './CategoryTabs';
import SortBar from './SortBar';

export default function CityFilterSection() {
  const { city } = useParams();

  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      let query = `?min_price=${priceRange[0]}&max_price=${priceRange[1]}&page=${currentPage}&min_rating=${ratingFilter}`;
      if (selectedCategories.length > 0) query += `&categories=${selectedCategories.join(',')}`;

      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URLL}api/${city}/all-items${query}`)
        .then((res) => {
          if (res.status === 200) {
            setProducts(res?.data?.data || []);
            setPagination(res?.data);
          }
        })
        .catch(() => {
          setProducts([]);
          setPagination(null);
        })
        .finally(() => setIsLoading(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [priceRange, selectedCategories, currentPage, city, ratingFilter]);

  return (
    <div className="mx-auto max-w-[1480px] px-4 sm:px-6 xl:px-0 py-[70px]">
      {/* Tabs + Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
        <CategoryTabs onTabChange={() => setCurrentPage(1)} />
        <SortBar />
      </div>

      {/* Sidebar + Grid */}
      <div className="flex flex-col sm:flex-row gap-6">
        <FilterSidebar
          selectedCategories={selectedCategories}
          onCategoryChange={(cats) => {
            setSelectedCategories(cats);
            setCurrentPage(1);
          }}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          ratingFilter={ratingFilter}
          onRatingChange={(r) => {
            setRatingFilter(r);
            setCurrentPage(1);
          }}
        />

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading && <LoadingPage />}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${isLoading ? 'opacity-50' : ''}`}>
            {!isLoading && products.length > 0 ? (
              products.map((product, index) => {
                const card = mapProductToItemCard(product, city);
                return (
                  <ItemCard
                    key={card.id || index}
                    href={card.href}
                    image={card.image}
                    title={card.title}
                    price={card.price}
                    rating={card.rating}
                    reviewCount={card.reviewCount}
                    discount={card.discount}
                    variant="full"
                  />
                );
              })
            ) : !isLoading ? (
              <div className="col-span-full flex items-center justify-center min-h-[300px]">
                <span className="text-lg text-[#6b7b8d]">No items found</span>
              </div>
            ) : null}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: pagination.last_page }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`flex items-center justify-center size-[35px] rounded-[7.68px] border text-[#435a67] transition ${
                    currentPage === i + 1 ? 'opacity-100 shadow-[0_1.89px_4.13px_rgba(60,66,87,0.08)]' : 'opacity-45'
                  }`}
                  style={{
                    borderColor: '#e0e6eb',
                    fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
                    fontWeight: 400,
                    fontSize: '21px',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
