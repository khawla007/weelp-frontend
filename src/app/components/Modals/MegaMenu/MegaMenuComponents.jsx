import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const FONT_FAMILY = 'var(--font-interTight), Inter Tight, sans-serif';

const CONNECTORS = new Set(['of', 'and', 'the', 'de', 'la', 'le', 'el', 'y']);

const shortenCountryName = (name) => {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) return name;
  return words
    .filter((w) => !CONNECTORS.has(w.toLowerCase()))
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
};

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
            className={`flex w-full items-center justify-between px-[33px] py-3 text-left text-[15px] transition-[background-color,color] duration-200 ease-out motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-weelp-sage-deep/40 ${
              isActive ? 'bg-weelp-sage-deep/10 text-weelp-sage-deep' : 'text-popover-foreground'
            }`}
            style={{
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

export const CountryCards = ({ countries = [], selectedCountryId, onSelect }) => (
  <div className="flex gap-3 border-b border-border/50 px-[17px] pt-[17px] pb-[15px]">
    {countries.slice(0, 3).map((country, idx) => {
      const isSelected = country.id === selectedCountryId;
      return (
        <button
          key={country.id}
          type="button"
          onClick={() => onSelect(country.id)}
          aria-pressed={isSelected}
          className="group relative block h-[96px] w-[154px] shrink-0 overflow-hidden rounded-[6px] transition-opacity duration-150 motion-reduce:transition-none hover:opacity-95 focus:outline-none"
        >
          {country.featured_image ? <img src={country.featured_image} alt={country.name} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-muted" />}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/50" />
          {isSelected && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[6px] ring-2 ring-inset ring-background after:absolute after:inset-1 after:rounded-[4px] after:ring-2 after:ring-inset after:ring-weelp-sage-deep"
            />
          )}
          <div className="absolute inset-x-[13px] bottom-[13px] flex flex-col items-start gap-[1px] text-left">
            <span
              className="leading-tight"
              style={{
                color: 'hsl(var(--background))',
                fontFamily: FONT_FAMILY,
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {idx + 1}. {shortenCountryName(country.name)}
            </span>
            <span
              className="leading-tight"
              style={{
                color: 'hsl(var(--muted-foreground))',
                fontFamily: FONT_FAMILY,
                fontSize: '10px',
                fontWeight: 500,
              }}
            >
              {country.cities_count ?? 0} Cities
            </span>
          </div>
        </button>
      );
    })}
    {countries.length === 0 && <div className="w-full py-6 text-center text-sm text-muted-foreground">No countries available.</div>}
  </div>
);

export const CityGrid = ({ cities = [] }) => {
  if (cities.length === 0) return null;

  return (
    <ul className="grid grid-cols-4 gap-x-4 gap-y-[18px] px-[19px] pt-[18px] pb-4">
      {cities.map((city) => (
        <li key={city.id}>
          <Link
            href={`/cities/${city.slug}`}
            className="text-muted-foreground transition-colors duration-200 ease-out motion-reduce:transition-none hover:text-weelp-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {city.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};
