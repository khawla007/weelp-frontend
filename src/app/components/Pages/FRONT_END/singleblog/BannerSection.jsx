import React from 'react';
import styles from './bannerSection.module.css';
import MediaImage from '@/app/components/MediaImage';

/**
 *
 * @type {BlogPost}
 */

const BannerSectionBlog = ({ name = '', title = '', excerpt = '', tags = [], media_gallery = [] }) => {
  const heading = name || title || '32 Best Places and Tours to See Autumn Leaves';
  const orderedMedia = (Array.isArray(media_gallery) ? media_gallery : [])
    .filter((media) => typeof media?.url === 'string' && media.url.trim())
    .sort((a, b) => Number(Boolean(b?.is_featured)) - Number(Boolean(a?.is_featured)));
  const hasSingleImage = orderedMedia.length === 1;

  return (
    <section
      className={`weelp-hero-rise mb-10 grid min-w-0 grid-cols-1 gap-6 px-4 py-8 md:mb-16 md:px-8 lg:mb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:py-10 ${styles.banner_single_blog}`}
    >
      <div className="flex min-w-0 w-full flex-col justify-center lg:ps-20">
        <div className="mx-auto min-w-0 w-full max-w-3xl">
          <div className="flex flex-col gap-4">
            <h1 className="break-words text-3xl font-semibold leading-tight first-letter:capitalize sm:text-[52px]">
              <span className="weelp-rise-mask weelp-rise-mask--block">
                <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
                  {heading}
                </span>
              </span>
            </h1>
            <p className="break-words text-sm font-medium text-weelp-steel sm:text-lg">
              <span className="weelp-rise-mask weelp-rise-mask--block">
                <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>
                  {excerpt || 'You&apos;ll discover everything from whisky to Harry Potter, or even some bodysnatchers, in Scotland.'}
                </span>
              </span>
            </p>
          </div>

          {tags.length > 0 && (
            <div className="weelp-hero-ui-rise mt-6 flex flex-wrap gap-2 sm:gap-3" style={{ '--weelp-motion-delay': '360ms' }}>
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
      </div>

      {/* Media Gallery */}
      {orderedMedia.length > 0 && (
        <div data-blog-gallery className={`tfc_scroll min-w-0 max-w-full overflow-y-hidden pb-2 ${hasSingleImage ? 'overflow-hidden' : 'overflow-x-auto'}`}>
          <div className={`flex gap-3 pr-1 ${hasSingleImage ? 'w-full' : 'w-max max-w-none'}`}>
            {orderedMedia.map((media, index) => (
              <div
                key={media.media_id || media.url}
                data-blog-gallery-item
                className={`relative aspect-[4/3] w-[82vw] max-w-[320px] shrink-0 overflow-hidden rounded-lg bg-muted ${hasSingleImage ? 'lg:aspect-[2/1] lg:w-full lg:max-w-none' : ''}`}
              >
                <MediaImage
                  src={media.url}
                  alt={media.alt || `Gallery Image ${index + 1}`}
                  fill
                  sizes={hasSingleImage ? '(max-width: 1023px) 82vw, 50vw' : '(max-width: 1023px) 82vw, 320px'}
                  className="object-cover object-center transition-transform duration-500 hover:scale-105 motion-reduce:hover:scale-100"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default BannerSectionBlog;
