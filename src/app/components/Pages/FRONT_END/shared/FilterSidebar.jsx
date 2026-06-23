'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import '@/app/styles/range-slider.css';
import '@/app/styles/date-picker.css';
import { Star } from 'lucide-react';

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
    <div className="w-full lg:max-w-xs bg-background h-fit rounded-[11.5px] p-4 sm:p-5 lg:p-6 lg:px-7" style={{ boxShadow: '0 2.22px 5.63px rgba(0,0,0,0.05)' }}>
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
                  style={{ ...FONT, fontWeight: 500, color: selectedItemType === type.value ? 'hsl(var(--weelp-sage-deep))' : '#435a67' }}
                >
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-base md:text-[16px] lg:text-[18px] text-foreground mb-4" style={{ ...FONT, fontWeight: 500 }}>
            Categories
          </h3>
          <div className="flex flex-col space-y-3 max-h-56 md:max-h-64 lg:max-h-72 overflow-auto">
            <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="checkbox"
                checked={selectedCategories.length === 0}
                onChange={() => handleCheckbox('all')}
                disabled={disabled}
                className={`size-[19px] rounded-[2px] border-2 accent-weelp-sage-deep transition-colors duration-200 motion-reduce:transition-none ${
                  selectedCategories.length === 0 ? 'border-weelp-sage-deep' : 'border-border'
                }`}
              />
              <span
                className="text-[18px] transition-colors duration-200 motion-reduce:transition-none"
                style={{ ...FONT, fontWeight: 500, color: selectedCategories.length === 0 ? 'hsl(var(--weelp-sage-deep))' : '#435a67' }}
              >
                All
              </span>
            </label>
            {categories.map((cat, i) => {
              const active = selectedCategories.includes(cat?.name);
              return (
                <label key={cat?.name ?? i} className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckbox(cat?.name)}
                    disabled={disabled}
                    className={`size-[19px] rounded-[2px] border-2 accent-weelp-sage-deep transition-colors duration-200 motion-reduce:transition-none ${active ? 'border-weelp-sage-deep' : 'border-border'}`}
                  />
                  <span
                    className="text-[18px] transition-colors duration-200 motion-reduce:transition-none"
                    style={{ ...FONT, fontWeight: 500, color: active ? 'hsl(var(--weelp-sage-deep))' : '#435a67' }}
                  >
                    {cat?.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-base md:text-[16px] lg:text-[18px] text-foreground mb-4" style={{ ...FONT, fontWeight: 500 }}>
            Price
          </h3>
          <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
            <ReactRangeSliderInput min={0} max={5000} step={10} value={priceRange} onInput={onPriceChange} className="w-full city-price-slider" disabled={disabled} />
            <div className="flex justify-between mt-2">
              <span className="text-[14px] text-weelp-steel" style={{ ...FONT, fontWeight: 500 }}>
                ${priceRange[0]}
              </span>
              <span className="text-[14px] text-weelp-steel" style={{ ...FONT, fontWeight: 500 }}>
                ${priceRange[1]}
              </span>
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div>
          <h3 className="text-base md:text-[16px] lg:text-[18px] text-foreground mb-4" style={{ ...FONT, fontWeight: 500 }}>
            Ratings
          </h3>
          <div className={`flex flex-col gap-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {[5, 4, 3].map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={ratingFilter === r}
                  onChange={() => onRatingChange(r)}
                  disabled={disabled}
                  className="size-[19px] accent-weelp-sage-deep transition-colors duration-200 motion-reduce:transition-none"
                />
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={19} className={i < r ? 'fill-warning stroke-none' : 'stroke-warning fill-none'} strokeWidth={2} />
                  ))}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
