'use client';

import ProductSliderSection from '@/app/components/ui/ProductSliderSection';
import { mapBlogToItemCard } from '@/lib/mapProductToItemCard';

/**
 * Shared editorial carousel used across public blog surfaces.
 */
export default function BlogSection({ blogs = [], title = 'Your Guide', navigationId = 'blog-section', className = '' }) {
  const items = blogs.map(mapBlogToItemCard);
  if (!items.length) return null;

  return (
    <ProductSliderSection
      items={items}
      title={title}
      navigationId={navigationId}
      itemVariant="editorial"
      carouselEntrance="stagger-right"
      className={className}
    />
  );
}
