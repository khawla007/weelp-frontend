'use client';
import { useCallback, useMemo, useState } from 'react';
import { useMegaMenu } from '@/hooks/api/public/menu/megaMenu';
import { MenuList, CityCards, PlaceGrid } from './MegaMenuComponents';

const TRENDING_ID = 'trending';

const MegaMenu = () => {
  const { regions, trending, isLoading, error } = useMegaMenu();
  const [activeId, setActiveId] = useState(TRENDING_ID);

  const items = useMemo(
    () => [
      { id: TRENDING_ID, name: 'Trending Destinations', cities: trending },
      ...regions.map((r) => ({ id: r.id, name: r.name, cities: r.cities })),
    ],
    [regions, trending],
  );

  const activeItem = useMemo(
    () => items.find((i) => i.id === activeId) ?? items[0],
    [items, activeId],
  );

  const handleListLeave = useCallback(() => {
    setActiveId(TRENDING_ID);
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
      <aside
        className="flex w-[244px] flex-col border-r border-[#cccccc80]"
        onMouseLeave={handleListLeave}
      >
        <MenuList items={items} hoveredId={activeId} onHover={setActiveId} />
      </aside>

      <section className="flex flex-1 flex-col overflow-y-auto">
        <CityCards cities={activeItem?.cities ?? []} />
        <PlaceGrid cities={activeItem?.cities ?? []} />
      </section>
    </div>
  );
};

export default MegaMenu;
