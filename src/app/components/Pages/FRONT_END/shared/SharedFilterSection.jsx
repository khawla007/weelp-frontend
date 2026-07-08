'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import ItemCard from '@/app/components/ui/item-card';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import { ProductCardSkelton } from '@/app/components/Animation/Cards';
import Pagination from '@/app/components/ui/Pagination';
import FilterSidebar from './FilterSidebar';
import FilterDrawer from './FilterDrawer';

/**
 * Shared filter + listing section used by both city and region pages.
 *
 * @param {{ scope: 'city' | 'region', slug: string, variant?: 'default' | 'home', className?: string }} props
 */
const SECTION_CLASS_BY_VARIANT = {
  default: 'mx-auto max-w-pen px-4 sm:px-6 xl:px-0 pb-10 md:pb-16 lg:pb-24',
  home: 'container-page pb-7 md:pb-16 lg:pb-24',
};

export default function SharedFilterSection({ scope, slug, variant = 'default', className = '' }) {
  const sectionRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [selectedItemType, setSelectedItemType] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [revealKey, setRevealKey] = useState(0);

  const handlePageChange = useCallback(
    (page) => {
      if (page === currentPage) return;
      setCurrentPage(page);
      const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' }), 50);
    },
    [currentPage],
  );

  const clearFilters = useCallback(() => {
    setSelectedItemType('');
    setSelectedCategories([]);
    setPriceRange([0, 5000]);
    setRatingFilter(0);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      let query = `?min_price=${priceRange[0]}&max_price=${priceRange[1]}&page=${currentPage}&per_page=8&min_rating=${ratingFilter}`;
      if (selectedItemType) query += `&item_type=${selectedItemType}`;
      if (selectedCategories.length > 0) query += `&categories=${selectedCategories.join(',')}`;

      const endpoint = scope === 'region' ? `/api/public/region/${slug}/all-items${query}` : `/api/public/cities/${slug}/all-items${query}`;

      axios
        .get(endpoint)
        .then((res) => {
          if (res.status === 200) {
            setProducts(res?.data?.data || []);
            setPagination(res?.data);
            setRevealKey((k) => k + 1);
          }
        })
        .catch(() => {
          setProducts([]);
          setPagination(null);
        })
        .finally(() => {
          setIsLoading(false);
          setHasLoaded(true);
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [priceRange, selectedItemType, selectedCategories, currentPage, slug, ratingFilter, scope]);

  const sectionClassName = `${SECTION_CLASS_BY_VARIANT[variant] || SECTION_CLASS_BY_VARIANT.default} ${className}`.trim();

  return (
    <div ref={sectionRef} className={sectionClassName}>
      {/* Sidebar + Grid */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <div className="hidden lg:block">
          <FilterSidebar
            selectedItemType={selectedItemType}
            onItemTypeChange={(type) => {
              setSelectedItemType(type);
              setCurrentPage(1);
            }}
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
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-3 lg:hidden">
            <FilterDrawer
              selectedItemType={selectedItemType}
              onItemTypeChange={(type) => {
                setSelectedItemType(type);
                setCurrentPage(1);
              }}
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
          </div>
          {!hasLoaded ? (
            <div className="flex gap-4 flex-wrap justify-center">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkelton key={i} className="sm:max-w-xs w-full" />
              ))}
            </div>
          ) : (
            <div
              key={revealKey}
              data-testid="result-grid"
              aria-busy={isLoading}
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 transition-opacity duration-200 motion-reduce:transition-none ${
                isLoading ? 'opacity-60 pointer-events-none motion-reduce:opacity-100' : 'opacity-100'
              }`}
            >
              {products.length > 0 ? (
                products.map((product, i) => {
                  const fallbackCity = scope === 'city' ? slug : undefined;
                  const card = mapProductToItemCard(product, product?.city_slug || fallbackCity);
                  return (
                    <ItemCard
                      key={`${product.item_type}-${card.id}`}
                      href={card.href}
                      image={card.image}
                      title={card.title}
                      price={card.price}
                      rating={card.rating}
                      reviewCount={card.reviewCount}
                      discount={card.discount}
                      variant="full"
                      className="weelp-fade-up"
                      style={{
                        '--weelp-motion-duration': '260ms',
                        '--weelp-motion-delay': i < 8 ? `${i * 50}ms` : '0ms',
                      }}
                    />
                  );
                })
              ) : (
                <div data-testid="empty-state" className="weelp-fade-up col-span-full flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
                  <p className="text-lg text-muted-foreground">No items match your filters.</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex min-h-[44px] items-center rounded-[11.5px] border border-weelp-sage-deep bg-background px-5 py-2.5 text-[16px] font-medium text-weelp-copy transition-colors duration-200 motion-reduce:transition-none hover:bg-weelp-sage-deep hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={pagination?.last_page || 1} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
