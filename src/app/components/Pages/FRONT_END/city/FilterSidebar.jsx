'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
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
    <div className="w-full sm:max-w-xs bg-white h-fit rounded-[11.5px] p-6 px-7" style={{ boxShadow: '0 2.22px 5.63px rgba(0,0,0,0.05)' }}>
      <div className="flex flex-col gap-10">
        {/* Item Type */}
        <div>
          <h3 className="text-[18px] text-[#143042] mb-4" style={{ ...FONT, fontWeight: 500 }}>
            Item Type
          </h3>
          <div className={`flex flex-col gap-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {[
              { value: '', label: 'All' },
              { value: 'activity', label: 'Activity' },
              { value: 'package', label: 'Package' },
              { value: 'itinerary', label: 'Itinerary' },
            ].map((type) => (
              <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="itemType"
                  checked={selectedItemType === type.value}
                  onChange={() => onItemTypeChange(type.value)}
                  disabled={disabled}
                  className="size-[19px] accent-[#57947d]"
                />
                <span className="text-[18px] text-[#435a67]" style={{ ...FONT, fontWeight: 500 }}>
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-[18px] text-[#143042] mb-4" style={{ ...FONT, fontWeight: 500 }}>
            Categories
          </h3>
          <div className="flex flex-col space-y-3 max-h-48 overflow-auto">
            <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="checkbox"
                checked={selectedCategories.length === 0}
                onChange={() => handleCheckbox('all')}
                disabled={disabled}
                className="size-[19px] rounded-[2px] border-2 border-[#667085] accent-[#57947d]"
              />
              <span className="text-[18px] text-[#435a67]" style={{ ...FONT, fontWeight: 500 }}>
                All
              </span>
            </label>
            {categories.map((cat, i) => (
              <label key={i} className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat?.name)}
                  onChange={() => handleCheckbox(cat?.name)}
                  disabled={disabled}
                  className="size-[19px] rounded-[2px] border-2 border-[#667085] accent-[#57947d]"
                />
                <span className="text-[18px] text-[#435a67]" style={{ ...FONT, fontWeight: 500 }}>
                  {cat?.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-[18px] text-[#143042] mb-4" style={{ ...FONT, fontWeight: 500 }}>
            Price
          </h3>
          <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
            <ReactRangeSliderInput min={0} max={5000} step={10} value={priceRange} onInput={onPriceChange} className="w-full city-price-slider" disabled={disabled} />
            <div className="flex justify-between mt-2">
              <span className="text-[14px] text-[#435a67]" style={{ ...FONT, fontWeight: 500 }}>
                ${priceRange[0]}
              </span>
              <span className="text-[14px] text-[#435a67]" style={{ ...FONT, fontWeight: 500 }}>
                ${priceRange[1]}
              </span>
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div>
          <h3 className="text-[18px] text-[#143042] mb-4" style={{ ...FONT, fontWeight: 500 }}>
            Ratings
          </h3>
          <div className={`flex flex-col gap-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {[5, 4, 3].map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="rating" checked={ratingFilter === r} onChange={() => onRatingChange(r)} disabled={disabled} className="size-[19px] accent-[#57947d]" />
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={19} className={i < r ? 'fill-[#fed141] stroke-none' : 'stroke-[#fed141] fill-none'} strokeWidth={2} />
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
