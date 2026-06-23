'use client';
import React, { useState, useReducer } from 'react';
import Sidebar from './Sidebar';
import TopBarFilter from '../../shop/shoppagefilter/TopBarFilter';
import SingleProductCard from '@/app/components/SingleProductCard';
import { fakeData } from '@/app/Data/ShopData';
import { ChevronRight } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';

// Reducer Logic
const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CATEGORY':
      const category = action.payload;
      const isAlreadySelected = state.category.includes(category);

      return {
        ...state,
        category: isAlreadySelected
          ? state.category.filter((item) => item !== category) // Remove if already selected
          : [...state.category, category], // Add if not already selected
      };

    case 'UPDATE_AVAILABILITY':
      return { ...state, availability: action.payload };

    case 'UPDATE_PRICE_RANGE':
      return { ...state, priceRange: action.payload };

    case 'UPDATE_RATING':
      return { ...state, rating: action.payload };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  availability: null,
  priceRange: null,
  rating: null,
  category: [], // Initialize category as an array
};

// Filter of Special Page
export const SpecialFilter = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Dynamically filter fakeData
  const filteredItems = fakeData.filter((item) => {
    // Filter by category
    if (state.category.length > 0 && !state.category.includes(item.category)) {
      return false;
    }

    // Filter by price range
    if (state.priceRange !== null) {
      const price1 = state.priceRange.price1; // First price
      const price2 = state.priceRange.price2; // Second price
      if (item.price !== price1 && item.price !== price2) {
        return false; // Item price doesn't match either of the two prices
      }
    }

    // Filter by rating
    if (state.rating !== null && item.rating < state.rating) {
      return false;
    }
    return true;
  });

  // Pagination Functionality
  const itemsPerPage = 6; // Number of items to display per page
  const [currentPage, setCurrentPage] = useState(1); // Starting from page 1

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage); // Total number of pages

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section className="bg-surface-tint hidden lg:block">
      <div className="flex container mx-auto">
        <div className="flex-[1] flex justify-center py-12">
          <Sidebar dispatch={dispatch} data={fakeData} />
        </div>
        <div className="flex-[2] py-4">
          <Reveal variant="lift">
            <TopBarFilter dispatch={dispatch} />
          </Reveal>
          {/* Filtered data */}
          <div className="flex flex-col py-4">
            {currentItems.length > 0 ? (
              <Reveal initialHidden stagger={60} variant="lift" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((item, index) => (
                  <SingleProductCard key={item.id} productId={item.id} imgsrc={item.image} productTitle={item.name} />
                ))}
              </Reveal>
            ) : (
              <p className="text-center text-muted-foreground">No items match the selected filters.</p>
            )}

            {/* Pagination */}
            <div className="flex justify-end gap-2 mt-6">
              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`p-2 px-4 shadow-md dark:shadow-none rounded border border-border ${currentPage === index + 1 ? ' bg-card text-foreground ' : ' '}`}
                >
                  {index + 1}
                </button>
              ))}

              {/* Next Button */}
              {currentPage < totalPages && (
                <button onClick={() => handlePageChange(currentPage + 1)} className="p-2 px-4 shadow-md dark:shadow-none rounded border bg-background text-foreground-300">
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
