'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import ItemCard from '@/app/components/ui/item-card';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import { ProductCardSkelton } from '@/app/components/Animation/Cards';
import Pagination from '@/app/components/ui/Pagination';
import FilterSidebar from './FilterSidebar';

export default function CityFilterSection() {
  const { city } = useParams();

  const sectionRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [selectedItemType, setSelectedItemType] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handlePageChange = useCallback(
    (page) => {
      if (page === currentPage) return;
      setCurrentPage(page);
      setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    },
    [currentPage],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      let query = `?min_price=${priceRange[0]}&max_price=${priceRange[1]}&page=${currentPage}&per_page=8&min_rating=${ratingFilter}`;
      if (selectedItemType) query += `&item_type=${selectedItemType}`;
      if (selectedCategories.length > 0) query += `&categories=${selectedCategories.join(',')}`;

      axios
        .get(`/api/public/cities/${city}/all-items${query}`)
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
  }, [priceRange, selectedItemType, selectedCategories, currentPage, city, ratingFilter]);

  return (
    <div ref={sectionRef} className="mx-auto max-w-[1480px] px-4 sm:px-6 xl:px-0 py-[70px]">
      {/* Sidebar + Grid */}
      <div className="flex flex-col sm:flex-row gap-6">
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

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex gap-4 flex-wrap justify-center">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkelton key={i} className="sm:max-w-xs w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.length > 0 ? (
                products.map((product, index) => {
                  const card = mapProductToItemCard(product, city);
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
                    />
                  );
                })
              ) : (
                <div className="col-span-full flex items-center justify-center min-h-[300px]">
                  <span className="text-lg text-[#6b7b8d]">No items found</span>
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
