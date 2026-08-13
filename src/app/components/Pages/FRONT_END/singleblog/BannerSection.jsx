import React from 'react';
import BreadCrumb from '@/app/components/BreadCrumb';
import GallerySlider from '@/app/components/sliders/GallerySlider';
import BlogPublishedDate from '@/app/components/ui/BlogPublishedDate';

/**
 *
 * @type {BlogPost}
 */

const BannerSectionBlog = ({ name = '', title = '', excerpt = '', published_at = '', tags = [], media_gallery = [] }) => {
  const heading = name || title || '32 Best Places and Tours to See Autumn Leaves';
  const orderedMedia = (Array.isArray(media_gallery) ? media_gallery : [])
    .map((media) => {
      const src = typeof media?.url === 'string' && media.url.trim() ? media.url.trim() : typeof media?.image === 'string' && media.image.trim() ? media.image.trim() : '';
      return src
        ? {
            ...media,
            url: src,
            image: src,
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => Number(Boolean(b?.is_featured)) - Number(Boolean(a?.is_featured)))
    .map((media, index) => ({
      ...media,
      alt_text: media.alt_text || media.alt || `Blog image ${index + 1}`,
    }));

  return (
    <section className="weelp-hero-rise mb-10 bg-background md:mb-16 lg:mb-24">
      <div className="mx-auto max-w-pen bg-background px-4">
        <div data-blog-heading className="flex flex-col gap-2 pt-6 md:pt-[70px]">
          <div className="weelp-hero-ui-rise" style={{ '--weelp-motion-delay': '120ms' }}>
            <BreadCrumb className="mb-2" />
          </div>

          <div className="flex flex-col gap-2 pb-4">
            <h1 className="break-words text-2xl font-semibold capitalize text-foreground lg:text-[38px]">
              <span className="weelp-rise-mask weelp-rise-mask--block">
                <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
                  {heading}
                </span>
              </span>
            </h1>

            {excerpt && (
              <p className="max-w-4xl break-words text-sm font-medium text-muted-foreground sm:text-lg">
                <span className="weelp-rise-mask weelp-rise-mask--block">
                  <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '260ms' }}>
                    {excerpt}
                  </span>
                </span>
              </p>
            )}

            <BlogPublishedDate date={published_at} className="weelp-hero-ui-rise text-sm font-medium text-muted-foreground sm:text-base" />

            {tags.length > 0 && (
              <div className="weelp-hero-ui-rise flex flex-wrap gap-2 sm:gap-3" style={{ '--weelp-motion-delay': '320ms' }}>
                {tags.map((tag) => (
                  <span
                    key={tag.id || tag.slug || tag.name}
                    data-blog-tag
                    className="inline-flex min-h-11 items-center rounded-full bg-surface-tint px-4 py-2 text-sm font-medium capitalize text-weelp-copy"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-b border-border" />
        </div>

        {orderedMedia.length > 0 && (
          <div data-blog-gallery className="weelp-hero-ui-rise mt-6" style={{ '--weelp-motion-delay': '380ms' }}>
            <GallerySlider data={orderedMedia} collapseHiddenThumbnails />
          </div>
        )}
      </div>
    </section>
  );
};

export default BannerSectionBlog;
