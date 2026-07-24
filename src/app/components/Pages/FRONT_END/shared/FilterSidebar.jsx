'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '@/app/styles/date-picker.css';
import { ListingFilterPanel, ListingOptionGroup, ListingPriceRange, ListingRatingFilter } from './ListingFilterPanel';

const FONT = { fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' };

export default function FilterSidebar({ disabled = false, selectedItemType, onItemTypeChange, selectedCategories, onCategoryChange, priceRange, onPriceChange, ratingFilter, onRatingChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get('/api/public/taxonomies/categories')
      .then((res) => {
        if (res.status === 200) setCategories(res?.data?.data || []);
      })
      .catch(() => setCategories([]));
  }, []);

  const handleCheckbox = useCallback(
    (name) => {
      if (name === 'all') {
        onCategoryChange([]);
      } else {
        onCategoryChange(selectedCategories.includes(name) ? selectedCategories.filter((c) => c !== name) : [...selectedCategories, name]);
      }
    },
    [selectedCategories, onCategoryChange],
  );

  return (
    <ListingFilterPanel>
      <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
        {/* Item Type */}
        <div>
          <h3 className="text-base md:text-[16px] lg:text-[18px] text-foreground mb-4" style={{ ...FONT, fontWeight: 500 }}>
            Item Type
          </h3>
          <div className={`flex flex-col gap-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {[
              { value: '', label: 'All' },
              { value: 'activity', label: 'Activity' },
              { value: 'itinerary', label: 'Itinerary' },
            ].map((type) => (
              <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="itemType"
                  checked={selectedItemType === type.value}
                  onChange={() => onItemTypeChange(type.value)}
                  disabled={disabled}
                  className="size-[19px] accent-weelp-sage-deep transition-colors duration-200 motion-reduce:transition-none"
                />
                <span
                  className="text-[18px] transition-colors duration-200 motion-reduce:transition-none"
                  style={{ ...FONT, fontWeight: 500, color: selectedItemType === type.value ? 'hsl(var(--weelp-sage-text))' : '#435a67' }}
                >
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <ListingOptionGroup
          title="Categories"
          options={categories.map((category) => ({ value: category.name, label: category.name }))}
          activeValues={selectedCategories}
          onToggle={handleCheckbox}
          onClear={() => handleCheckbox('all')}
          disabled={disabled}
        />

        <ListingPriceRange value={priceRange} onChange={onPriceChange} disabled={disabled} />

        <ListingRatingFilter value={ratingFilter} onChange={onRatingChange} disabled={disabled} />
      </div>
    </ListingFilterPanel>
  );
}
