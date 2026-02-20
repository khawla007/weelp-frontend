'use client';
import React, { useState, useMemo } from 'react';
import { fakeData } from '@/app/Data/ShopData';
import FilterBar from './FilterBar';
import ProductsList from './ProductsList';

const ShopProduct = () => {
  const [showPagination, setShowPagination] = useState(null);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: 1000,
    rating: null,
    locations: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filtered data
  const filteredData = useMemo(() => {
    return fakeData.filter((item) => {
      const inCategory = filters.categories.length === 0 || filters.categories.includes(item.category);
      const inPrice = item.price <= filters.priceRange;
      const inRating = filters.rating === null || item.rating >= filters.rating;
      const inLocation = filters.locations.length === 0 || filters.locations.includes(item.location);

      return inCategory && inPrice && inRating && inLocation;
    });
  }, [filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:gap-4 lg:gap-8 p-4">
        {/* Filter Bar */}
        <FilterBar filters={filters} setFilters={setFilters} />
        {/* Product Listing */}
        <ProductsList data={paginatedData} />
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="w-full flex justify-center mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} className={`px-4 py-2 mx-1 border ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => handlePageChange(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ShopProduct;
