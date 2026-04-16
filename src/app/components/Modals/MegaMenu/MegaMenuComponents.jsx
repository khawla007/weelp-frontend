import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const GREEN = '#57947d';
const GREEN_TINT = '#57947d1a';
const TEXT_DARK = '#1e1e1e';
const TEXT_MUTED = '#5a5a5a';
const FONT_FAMILY = 'var(--font-interTight), Inter Tight, sans-serif';

export const MenuList = ({ items = [], activeId, onSelect }) => (
  <ul className="flex flex-1 flex-col py-2">
    {items.map((item) => {
      const isActive = item.id === activeId;
      return (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect(item.id)}
            onFocus={() => onSelect(item.id)}
            aria-pressed={isActive}
            className="flex w-full items-center justify-between px-[33px] py-3 text-left text-[15px] transition"
            style={{
              backgroundColor: isActive ? GREEN_TINT : 'transparent',
              color: isActive ? GREEN : TEXT_DARK,
              fontFamily: FONT_FAMILY,
              fontWeight: isActive ? 500 : 400,
            }}
          >
            <span className="capitalize">{item.name}</span>
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </li>
      );
    })}
  </ul>
);

export const CityCards = ({ cities = [], selectedCityId, onSelect }) => (
  <div className="flex gap-3 border-b border-[#cccccc80] px-[17px] pt-[17px] pb-[15px]">
    {cities.slice(0, 3).map((city, idx) => {
      const isSelected = city.id === selectedCityId;
      return (
        <button
          key={city.id}
          type="button"
          onClick={() => onSelect(city.id)}
          aria-pressed={isSelected}
          className="group relative block h-[96px] w-[154px] shrink-0 overflow-hidden rounded-[6px] transition-all duration-150 hover:opacity-95 focus:outline-none"
        >
          {city.featured_image ? <img src={city.featured_image} alt={city.name} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-[#c9c9c9]" />}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)' }} />
          {isSelected && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[6px]"
              style={{ boxShadow: `inset 0 0 0 2px #ffffff, inset 0 0 0 4px ${GREEN}` }}
            />
          )}
          <div className="absolute inset-x-[13px] bottom-[13px] flex flex-col items-start gap-[1px] text-left">
            <span
              className="leading-tight"
              style={{
                color: '#ffffff',
                fontFamily: FONT_FAMILY,
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {idx + 1}. {city.name}
            </span>
            <span
              className="leading-tight"
              style={{
                color: '#dfdfeb',
                fontFamily: FONT_FAMILY,
                fontSize: '10px',
                fontWeight: 500,
              }}
            >
              {city.activities_count ?? 0} Activities
            </span>
          </div>
        </button>
      );
    })}
    {cities.length === 0 && (
      <div className="w-full py-6 text-center text-sm" style={{ color: TEXT_MUTED }}>
        No cities available.
      </div>
    )}
  </div>
);

export const PlaceGrid = ({ places = [] }) => {
  if (places.length === 0) return null;

  return (
    <ul className="grid grid-cols-4 gap-x-4 gap-y-[18px] px-[19px] pt-[18px] pb-4">
      {places.map((place) => (
        <li key={`${place.citySlug}-${place.id}`}>
          <Link
            href={`/cities/${place.citySlug}`}
            className="transition hover:text-[color:var(--green,#57947d)]"
            style={{
              color: TEXT_MUTED,
              fontFamily: FONT_FAMILY,
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {place.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};
