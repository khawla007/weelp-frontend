'use client';
import React, { useState, useEffect, useReducer } from 'react';
import TopBarFilter from './TopBarFilter';
import SideBarFilter from './SidebarFilter';
import { fakeData } from '@/app/Data/ShopData';
import SingleProductCard from '@/app/components/SingleProductCard';

// Initial Filter State
const initialState = {
  category: [],
  priceRange: 5000,
  rating: null,
  availability: null,
  location: [],
};

// Reducer to manage filter actions
const filterReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        category: state.category.includes(action.payload) ? state.category.filter((cat) => cat !== action.payload) : [...state.category, action.payload],
      };
    case 'UPDATE_PRICE_RANGE':
      return { ...state, priceRange: action.payload };
    case 'UPDATE_RATING':
      return { ...state, rating: action.payload };
    case 'UPDATE_AVAILABILITY':
      return { ...state, availability: action.payload };
    case 'UPDATE_LOCATION':
      return {
        ...state,
        location: state.location.includes(action.payload) ? state.location.filter((loc) => loc !== action.payload) : [...state.location, action.payload],
      };
    default:
      return state;
  }
};

const Shoppage = () => {
  const [isClient, setIsClient] = useState(false);
  const [filters, dispatch] = useReducer(filterReducer, initialState);
  const [filteredData, setFilteredData] = useState(fakeData);

  useEffect(() => {
    // Filter the product data whenever filters are updated
    const filtered = fakeData.filter((product) => {
      const byCategory = filters.category.length ? filters.category.includes(product.category) : true;
      const byPrice = product.price <= filters.priceRange;
      const byRating = filters.rating ? Math.ceil(product.rating) === Number(filters.rating) : true;
      const byAvailability = filters.availability ? product.availability === filters.availability : true;
      const byLocation = filters.location.length ? filters.location.includes(product.location) : true;

      return byCategory && byPrice && byRating && byAvailability && byLocation;
    });

    setFilteredData(filtered);
  }, [filters]);

  // intialize filter
  useEffect(() => {
    setIsClient(true);
  });

  if (isClient) {
    return (
      <section className="flex flex-col border-t-2 max-w-[1800px] mx-auto p-6">
        {/* <TopBarFilter dispatch={dispatch} /> */}

        <div className="flex gap-4 md:gap-12 flex-wrap flex-col sm:flex-row justify-center">
          <SideBarFilter filters={filters} dispatch={dispatch} />

          {/* Product Data */}
          <div className="flex-[4] flex flex-wrap gap-4">
            {filteredData.map((product) => (
              <SingleProductCard key={product.id} imgsrc={product.image} productTitle={product.name} productId={product.id} productPrice={product.price} productRating={product.rating} />
            ))}
          </div>
        </div>
      </section>
    );
  }
};

export default Shoppage;
