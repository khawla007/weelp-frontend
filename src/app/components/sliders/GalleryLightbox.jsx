'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';

import MediaImage from '@/app/components/MediaImage';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const wrapIndex = (index, total) => (index + total) % total;

const clampIndex = (index, total) => {
  if (total <= 0 || !Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), total - 1);
};

const GalleryLightbox = ({ images = [], initialIndex = 0 }) => {
  const [open, setOpen] = useState(false);
  const total = images.length;
  const [activeIndex, setActiveIndex] = useState(() => clampIndex(initialIndex, total));
  const activeImage = images[activeIndex];

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) {
      setActiveIndex(clampIndex(initialIndex, total));
    }
    setOpen(nextOpen);
  };

  const showPrevious = () => setActiveIndex((index) => wrapIndex(index - 1, total));
  const showNext = () => setActiveIndex((index) => wrapIndex(index + 1, total));

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPrevious();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNext();
    }
  };

  if (total === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="gallery_slider_toggle_btn absolute bottom-4 right-4 z-10 flex select-none items-center gap-2 rounded-lg bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm ring-1 ring-black/10 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-weelp-steel active:text-white dark:ring-white/10"
        >
          <Images aria-hidden="true" className="size-4" />
          See all {total} photos
        </button>
      </DialogTrigger>

      <DialogContent
        overlayClassName="!z-[100000]"
        className="!z-[100001] flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none flex-col gap-3 overflow-hidden border-0 bg-background p-3 sm:h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:rounded-2xl sm:p-5"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Photo gallery</DialogTitle>
        <DialogDescription className="sr-only">Browse all available photos.</DialogDescription>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          <MediaImage src={activeImage.src} alt={activeImage.alt} width={1600} height={1000} sizes="calc(100vw - 2rem)" className="max-h-full w-auto max-w-full object-contain" />
          <button type="button" aria-label="Previous photo" onClick={showPrevious} className="absolute left-3 rounded-full bg-background/90 p-3 shadow-md ring-1 ring-black/10">
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button type="button" aria-label="Next photo" onClick={showNext} className="absolute right-3 rounded-full bg-background/90 p-3 shadow-md ring-1 ring-black/10">
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>

        <p aria-live="polite" className="text-center text-sm font-medium text-muted-foreground">
          {activeIndex + 1} of {total}
        </p>

        <div aria-label="Gallery thumbnails" className="flex shrink-0 gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={`View photo ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => setActiveIndex(index)}
              className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MediaImage
                src={image.src}
                alt=""
                width={96}
                height={64}
                sizes="96px"
                className={`h-16 w-24 rounded-lg object-cover ring-2 ${index === activeIndex ? 'ring-weelp-sage-deep' : 'ring-transparent opacity-70'}`}
              />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
