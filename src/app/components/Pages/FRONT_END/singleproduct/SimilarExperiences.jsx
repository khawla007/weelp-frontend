'use client';

import ItemCard from '@/app/components/ui/item-card';
import SectionHeader from '@/app/components/ui/SectionHeader';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';

const SimilarExperiences = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col border-t border-[#eaeaea] pt-6">
      <SectionHeader title="Similar Experiences" className="mb-4" />

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
