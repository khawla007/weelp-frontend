import React from 'react';
import TabButton from '@/app/components/TabButton';
import styles from './bannerSection.module.css';
import { FALLBACK_IMAGE } from '@/constants/image';
import GallerySlider from '@/app/components/sliders/GallerySlider';
import MediaImage from '@/app/components/MediaImage';

/**
 *
 * @type {BlogPost}
 */

const BannerSectionBlog = ({ title = '', excerpt = '', tags = [], media_gallery = [] }) => {
  return (
    <section className={`weelp-hero-rise flex p-6 md:px-0 max-h-[400px] h-full items-center mb-10 md:mb-16 lg:mb-24 ${styles.banner_single_blog}`}>
      <div className="w-full md:ps-28 md:pe-8 min-h-full flex flex-col justify-center">
        <div className="2xl:w-3/4 mx-auto">
          <div className="flex flex-col gap-4">
            <h1 className="text-base sm:text-[52px] font-semibold leading-none first-letter:capitalize text-wrap">
              <span className="weelp-rise-mask weelp-rise-mask--block">
                <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
                  {title || '32 Best Places and Tours to See Autumn Leaves'}
                </span>
              </span>
            </h1>
            <p className="text-weelp-steel font-medium text-sm sm:text-lg  text-wrap">
              <span className="weelp-rise-mask weelp-rise-mask--block">
                <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>
                  {excerpt || 'You&apos;ll discover everything from whisky to Harry Potter, or even some bodysnatchers, in Scotland.'}
                </span>
              </span>
            </p>
          </div>

          {tags.length > 0 && (
            <div className="weelp-hero-ui-rise mt-20 flex gap-4" style={{ '--weelp-motion-delay': '360ms' }}>
              {tags.map(({ name }) => {
                return <TabButton key={name} text={name} className={'bg-surface-tint text-sm text-weelp-copy rounded-full'} />;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Media Gallery */}
      {media_gallery?.length > 0 && (
        <div className="2xl:block w-full hidden overflow-scroll  tfc_scroll max-h-[400px]">
          {media_gallery?.length > 1 ? (
            <div className="flex flex-row overflow-scroll overflow-y-hidden gap-2 tfc_scroll">
              {media_gallery.map((media, index) => (
                <MediaImage
                  key={index}
                  src={media.url}
                  alt={media.alt ?? `Gallery Image ${index + 1}`}
                  width={320}
                  height={400}
                  sizes="320px"
                  className="object-center rounded-lg max-w-80 w-full h-[400px] scale-95 hover:scale-100 ease-in-out duration-500 mr-4 motion-reduce:hover:scale-95"
                />
              ))}
            </div>
          ) : (
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
              <MediaImage
                src={media_gallery?.find((img) => img.is_featured)?.url || media_gallery?.[0]?.url}
                alt={media_gallery?.[0]?.alt ?? `Gallery Image`}
                fill
                sizes="800px"
                className="object-center"
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default BannerSectionBlog;
