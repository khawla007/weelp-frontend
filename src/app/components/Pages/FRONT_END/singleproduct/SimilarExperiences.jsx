'use client';

import ItemCard from '@/app/components/ui/item-card';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';

const SimilarExperiences = ({ activities = [] }) => {
  // If no activities provided, don't render
  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col border-t border-[#d9d9d9]">
      <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize pt-6 mb-4">
        Similar Experiences
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {activities.map((item) => {
          const cardProps = mapProductToItemCard(item);
          return <ItemCard key={cardProps.id || item.id} {...cardProps} variant="full" />;
        })}
      </div>
    </div>
  );
};

export default SimilarExperiences;
