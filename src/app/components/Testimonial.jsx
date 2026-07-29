import React from 'react';
import Image from 'next/image';
import { BadgeCheck, Star } from 'lucide-react';

const Testimonial = ({ username, title, date, itemName, rating }) => {
  const displayName = username || 'Anonymous';
  const numericRating = Number(rating);
  const safeRating = Number.isFinite(numericRating) ? Math.max(0, Math.min(5, Math.round(numericRating))) : 0;

  return (
    <div className="bg-background flex h-full flex-col gap-4 rounded-lg border border-border p-4">
      <div role="group" aria-label="Review metadata" className="flex items-start justify-between gap-4">
        <Image src="/assets/testimonial.png" alt={`${displayName} avatar`} width={64} height={64} sizes="64px" className="size-16 shrink-0 rounded-full object-cover" />
        {(safeRating > 0 || date) && (
          <div className="ml-auto flex shrink-0 flex-col items-end gap-2 text-right">
            {safeRating > 0 && (
              <div role="img" aria-label={`${safeRating} out of 5 stars`} className="flex gap-0.5">
                {Array.from({ length: safeRating }).map((_, i) => (
                  <Star key={i} aria-hidden="true" className="size-4 fill-yellow-400 stroke-none" />
                ))}
              </div>
            )}
            {date && <span className="whitespace-nowrap text-base font-normal uppercase text-muted-foreground">{date}</span>}
          </div>
        )}
      </div>

      <div role="group" aria-label="Traveler and reviewed item" className="w-full min-w-0">
        <h3 className="flex items-start gap-2 break-words text-xl font-semibold text-foreground">
          <span className="min-w-0 break-words">{displayName}</span>
          <BadgeCheck aria-hidden="true" className="shrink-0 fill-sky-500 text-xl text-white" />
        </h3>
        {itemName && <span className="block break-words font-normal text-muted-foreground">{itemName}</span>}
      </div>

      <p className="line-clamp-3 text-base font-normal text-foreground">{title || 'Great experience!'}</p>
    </div>
  );
};

export default Testimonial;
