'use client';
import { useCallback, useMemo, useState } from 'react';
import { useMegaMenu } from '@/hooks/api/public/menu/megaMenu';
import { MenuList, CityCards, PlaceGrid } from './MegaMenuComponents';

const TRENDING_ID = 'trending';

const MegaMenu = () => {
  const { regions, trending, isLoading, error } = useMegaMenu();
  const [activeId, setActiveId] = useState(TRENDING_ID);
  const [selectedCityId, setSelectedCityId] = useState(null);

  const items = useMemo(() => [{ id: TRENDING_ID, name: 'Trending Destinations', cities: trending }, ...regions.map((r) => ({ id: r.id, name: r.name, cities: r.cities }))], [regions, trending]);

  const activeItem = useMemo(() => items.find((i) => i.id === activeId) ?? items[0], [items, activeId]);
  const displayedCities = useMemo(() => (activeItem?.cities ?? []).slice(0, 3), [activeItem]);

  const places = useMemo(() => {
    if (selectedCityId) {
      const city = displayedCities.find((c) => c.id === selectedCityId);
      return (city?.places ?? []).slice(0, 20).map((p) => ({ ...p, citySlug: city.slug }));
    }
    return displayedCities.flatMap((city) => (city.places ?? []).map((p) => ({ ...p, citySlug: city.slug }))).slice(0, 20);
  }, [displayedCities, selectedCityId]);

  const handleSelectRegion = useCallback((id) => {
    setActiveId(id);
    setSelectedCityId(null);
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
      <div className="flex h-[417px] w-[769px] items-center justify-center rounded-[12px] border border-[#eee] bg-white shadow-xl">
        <span className="loader" />
      </div>
    );
  }

  return (
    <div className="flex h-[417px] w-[769px] overflow-hidden rounded-[12px] border border-[#eee] bg-white shadow-xl">
      <aside className="flex w-[244px] flex-col border-r border-[#cccccc80]">
        <MenuList items={items} activeId={activeId} onSelect={handleSelectRegion} />
      </aside>

      <section className="flex flex-1 flex-col overflow-y-auto">
        <CityCards cities={displayedCities} selectedCityId={selectedCityId} onSelect={(id) => setSelectedCityId((prev) => (prev === id ? null : id))} />
        <PlaceGrid places={places} />
      </section>
    </div>
  );
};

export default MegaMenu;
