'use client';
import { useCallback, useMemo, useState } from 'react';
import { useMegaMenu } from '@/hooks/api/public/menu/megaMenu';
import { MenuList, CountryCards, CityGrid } from './MegaMenuComponents';
import { Skeleton } from '@/components/ui/skeleton';

const TRENDING_ID = 'trending';

const MegaMenu = () => {
  const { regions, trending, isLoading, error } = useMegaMenu();
  const [activeId, setActiveId] = useState(TRENDING_ID);
  const [selectedCountryId, setSelectedCountryId] = useState(null);

  const items = useMemo(
    () => [{ id: TRENDING_ID, name: 'Trending Destinations', countries: trending }, ...regions.map((r) => ({ id: r.id, name: r.name, countries: r.countries }))],
    [regions, trending],
  );

  const activeItem = useMemo(() => items.find((i) => i.id === activeId) ?? items[0], [items, activeId]);
  const displayedCountries = useMemo(() => (activeItem?.countries ?? []).slice(0, 3), [activeItem]);

  const cities = useMemo(() => {
    if (selectedCountryId) {
      const country = displayedCountries.find((c) => c.id === selectedCountryId);
      return (country?.cities ?? []).slice(0, 20);
    }
    return displayedCountries.flatMap((country) => country.cities ?? []).slice(0, 20);
  }, [displayedCountries, selectedCountryId]);

  const handleSelectRegion = useCallback((id) => {
    setActiveId(id);
    setSelectedCountryId(null);
  }, []);

  if (error) {
    return (
      <div className="flex h-[417px] w-[769px] items-center justify-center rounded-[12px] border border-[#eee] bg-white shadow-xl">
        <span className="text-sm text-red-500">Couldn&rsquo;t load destinations. Try again.</span>
      </div>
    );
  }

  if (isLoading || !regions.length) {
    return (
      <div className="flex h-[417px] w-[769px] overflow-hidden rounded-[12px] border border-[#eee] bg-white shadow-xl" aria-hidden="true">
        <aside className="flex w-[244px] flex-col gap-3 border-r border-[#cccccc80] p-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-full rounded-md" />
          ))}
        </aside>
        <section className="flex flex-1 flex-col gap-4 p-4">
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex h-[417px] w-[769px] overflow-hidden rounded-[12px] border border-[#eee] bg-white shadow-xl">
      <aside className="flex w-[244px] flex-col border-r border-[#cccccc80]">
        <MenuList items={items} activeId={activeId} onSelect={handleSelectRegion} />
      </aside>

      <section className="flex flex-1 flex-col overflow-y-auto">
        <CountryCards countries={displayedCountries} selectedCountryId={selectedCountryId} onSelect={(id) => setSelectedCountryId((prev) => (prev === id ? null : id))} />
        <CityGrid cities={cities} />
      </section>
    </div>
  );
};

export default MegaMenu;
