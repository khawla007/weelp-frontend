# City Gallery Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the existing responsive media slider, remove its duplicate expandable gallery, and make a counted “See all N photos” action open an accessible lightbox.

**Architecture:** Normalize the supplied media once into unique `{ src, alt }` records, then share that array between the inline Swiper and a focused `GalleryLightbox`. The lightbox uses the project’s Radix dialog primitives for modal semantics and owns only modal navigation state; `GallerySlider` owns the inline active index and passes it as the lightbox’s opening index.

**Tech Stack:** Next.js 16, React 19, JavaScript/JSX, Swiper 12, Radix Dialog, Lucide React, Tailwind CSS, Jest, Testing Library

---

## File map

- Create `src/app/components/sliders/galleryMedia.js` — validate and deduplicate gallery media.
- Create `src/app/components/sliders/__tests__/galleryMedia.test.js` — normalization edge cases.
- Create `src/app/components/sliders/GalleryLightbox.jsx` — accessible full-gallery modal and navigation.
- Create `src/app/components/sliders/__tests__/GalleryLightbox.test.jsx` — modal behavior, wrapping navigation, thumbnails, and focus return.
- Modify `src/app/components/sliders/GallerySlider.jsx` — retain the main slider, track its active image, remove the inline thumbnail slider, and render the counted lightbox trigger.
- Modify `src/app/components/sliders/__tests__/GallerySlider.test.jsx` — integration behavior for zero, one, and multiple valid images.

### Task 1: Normalize valid, unique gallery media

**Files:**

- Create: `src/app/components/sliders/galleryMedia.js`
- Create: `src/app/components/sliders/__tests__/galleryMedia.test.js`

- [x] **Step 1: Write the failing normalization tests**

```js
import { normalizeGalleryMedia } from '../galleryMedia';

describe('normalizeGalleryMedia', () => {
  it('keeps valid url and image records with useful fallback alt text', () => {
    expect(
      normalizeGalleryMedia([
        { url: '/one.jpg', alt_text: 'Dubai skyline' },
        { image: '/two.jpg', name: 'Dubai creek' },
      ]),
    ).toEqual([
      { src: '/one.jpg', alt: 'Dubai skyline' },
      { src: '/two.jpg', alt: 'Dubai creek' },
    ]);
  });

  it('removes invalid records and duplicate sources without mutating the input', () => {
    const media = [
      { url: '/one.jpg' },
      { image: ' /one.jpg ', alt_text: 'Duplicate' },
      { url: '' },
      { url: ' ', image: '/fallback.jpg', name: 'Fallback image' },
      { url: 42 },
      { image: { path: '/invalid.jpg' } },
      null,
      { image: '/two.jpg' },
    ];
    const originalMedia = structuredClone(media);

    expect(normalizeGalleryMedia(media)).toEqual([
      { src: '/one.jpg', alt: 'Photo 1' },
      { src: '/fallback.jpg', alt: 'Fallback image' },
      { src: '/two.jpg', alt: 'Photo 3' },
    ]);
    expect(media).toEqual(originalMedia);
  });

  it('returns an empty array for non-array values', () => {
    expect(normalizeGalleryMedia()).toEqual([]);
    expect(normalizeGalleryMedia({ url: '/one.jpg' })).toEqual([]);
  });
});
```

- [x] **Step 2: Run the focused test and verify the missing-module failure**

Run:

```bash
npm run test:ci -- src/app/components/sliders/__tests__/galleryMedia.test.js --runInBand
```

Expected: FAIL because `../galleryMedia` does not exist.

- [x] **Step 3: Implement the normalizer**

```js
export const normalizeGalleryMedia = (data) => {
  if (!Array.isArray(data)) return [];

  const seenSources = new Set();

  return data.reduce((images, media) => {
    const src = [media?.url, media?.image].find((value) => typeof value === 'string' && value.trim())?.trim();

    if (!src || seenSources.has(src)) return images;

    seenSources.add(src);
    images.push({
      src,
      alt: media.alt_text || media.alt || media.name || `Photo ${images.length + 1}`,
    });

    return images;
  }, []);
};
```

- [x] **Step 4: Re-run the focused test**

Run:

```bash
npm run test:ci -- src/app/components/sliders/__tests__/galleryMedia.test.js --runInBand
```

Expected: PASS with 3 tests.

### Task 2: Build the accessible lightbox

**Files:**

- Create: `src/app/components/sliders/GalleryLightbox.jsx`
- Create: `src/app/components/sliders/__tests__/GalleryLightbox.test.jsx`

- [x] **Step 1: Write failing lightbox interaction tests**

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import GalleryLightbox from '../GalleryLightbox';

const images = [
  { src: '/one.jpg', alt: 'Dubai skyline' },
  { src: '/two.jpg', alt: 'Dubai creek' },
  { src: '/three.jpg', alt: 'Dubai desert' },
];

describe('GalleryLightbox', () => {
  it('opens on the requested image and returns focus to its trigger', () => {
    render(<GalleryLightbox images={images} initialIndex={1} />);

    const trigger = screen.getByRole('button', { name: 'See all 3 photos' });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Photo gallery' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Dubai creek' })).toBeInTheDocument();
    expect(screen.getByText('2 of 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(trigger).toHaveFocus();
  });

  it('closes with Escape and returns focus to its trigger', () => {
    render(<GalleryLightbox images={images} initialIndex={0} />);
    const trigger = screen.getByRole('button', { name: 'See all 3 photos' });
    fireEvent.click(trigger);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: 'Photo gallery' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes when the modal overlay is selected', () => {
    render(<GalleryLightbox images={images} initialIndex={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'See all 3 photos' }));

    const overlay = document.querySelector('[data-state="open"].fixed.inset-0');
    fireEvent.pointerDown(overlay);
    fireEvent.click(overlay);

    expect(screen.queryByRole('dialog', { name: 'Photo gallery' })).not.toBeInTheDocument();
  });

  it('wraps previous and next navigation and supports Arrow keys', () => {
    render(<GalleryLightbox images={images} initialIndex={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'See all 3 photos' }));

    fireEvent.click(screen.getByRole('button', { name: 'Previous photo' }));
    expect(screen.getByRole('img', { name: 'Dubai desert' })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Photo gallery' }), { key: 'ArrowRight' });
    expect(screen.getByRole('img', { name: 'Dubai skyline' })).toBeInTheDocument();
  });

  it('selects a photo from the thumbnail rail', () => {
    render(<GalleryLightbox images={images} initialIndex={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'See all 3 photos' }));
    fireEvent.click(screen.getByRole('button', { name: 'View photo 3' }));

    expect(screen.getByRole('img', { name: 'Dubai desert' })).toBeInTheDocument();
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
  });

  it.each([
    [-4, 'Dubai skyline'],
    [99, 'Dubai desert'],
    [Number.NaN, 'Dubai skyline'],
  ])('clamps an invalid initial index %s', (initialIndex, expectedAlt) => {
    render(<GalleryLightbox images={images} initialIndex={initialIndex} />);
    fireEvent.click(screen.getByRole('button', { name: 'See all 3 photos' }));
    expect(screen.getByRole('img', { name: expectedAlt })).toBeInTheDocument();
  });
});
```

- [x] **Step 2: Run the lightbox test and verify the missing-component failure**

Run:

```bash
npm run test:ci -- src/app/components/sliders/__tests__/GalleryLightbox.test.jsx --runInBand
```

Expected: FAIL because `../GalleryLightbox` does not exist.

- [x] **Step 3: Implement the lightbox with Radix Dialog**

Create `GalleryLightbox.jsx` with these exact responsibilities:

```jsx
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

const GalleryLightbox = ({ images, initialIndex = 0 }) => {
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
        className="flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none flex-col gap-3 overflow-hidden border-0 bg-background p-3 sm:h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:rounded-2xl sm:p-5"
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
```

- [x] **Step 4: Run and refine the focused tests**

Run:

```bash
npm run test:ci -- src/app/components/sliders/__tests__/GalleryLightbox.test.jsx --runInBand
```

Expected: PASS with all lightbox tests. If Radix restores focus asynchronously in JSDOM, change the focus tests to `async`, use `userEvent`, and assert with `await waitFor(() => expect(trigger).toHaveFocus())`. If JSDOM cannot produce a trustworthy focus-containment assertion, keep that behavior in the required headed-browser check rather than testing Radix internals.

### Task 3: Replace the duplicate inline gallery

**Files:**

- Modify: `src/app/components/sliders/GallerySlider.jsx`
- Modify: `src/app/components/sliders/__tests__/GallerySlider.test.jsx`

- [x] **Step 1: Replace the legacy test with failing integration coverage**

Keep the Swiper mock, but make it expose the active-slide callback:

```jsx
jest.mock('swiper/react', () => ({
  Swiper: ({ children, className = '', onSwiper, onSlideChange, navigation }) => {
    const React = require('react');
    React.useEffect(() => {
      onSwiper?.({ destroyed: false });
    }, [onSwiper]);
    return (
      <div className={className} data-navigation={String(navigation)}>
        {children}
        {onSlideChange ? (
          <button type="button" onClick={() => onSlideChange({ activeIndex: 1 })}>
            Simulate slide 2
          </button>
        ) : null}
      </div>
    );
  },
  SwiperSlide: ({ children, className = '' }) => <div className={className}>{children}</div>,
}));
```

Add these tests:

```jsx
it('removes the inline thumbnail gallery and opens the counted lightbox', () => {
  const { container } = render(<GallerySlider data={images} collapseHiddenThumbnails />);

  expect(container.querySelector('.thumbnail-gallery')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'See all 2 photos' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'See all 2 photos' }));
  expect(screen.getByRole('dialog', { name: 'Photo gallery' })).toBeInTheDocument();
});

it('filters invalid and duplicate media before displaying the count', () => {
  render(<GallerySlider data={[images[0], { url: '' }, { image: images[0].url }, images[1]]} />);
  expect(screen.getByRole('button', { name: 'See all 2 photos' })).toBeInTheDocument();
});

it('renders one image without slider navigation or a gallery action', () => {
  const { container } = render(<GallerySlider data={[images[0]]} />);
  expect(container.querySelector('.main-slider')).toHaveAttribute('data-navigation', 'false');
  expect(screen.queryByRole('button', { name: /see all/i })).not.toBeInTheDocument();
});

it('renders nothing when no valid images are supplied', () => {
  const { container } = render(<GallerySlider data={[null, { url: '' }]} />);
  expect(container).toBeEmptyDOMElement();
});

it('opens the lightbox on the active inline slide', () => {
  render(<GallerySlider data={images} />);
  fireEvent.click(screen.getByRole('button', { name: 'Simulate slide 2' }));
  fireEvent.click(screen.getByRole('button', { name: 'See all 2 photos' }));
  expect(screen.getByRole('img', { name: 'Dubai creek' })).toBeInTheDocument();
});
```

- [x] **Step 2: Run the slider tests and verify failures against legacy behavior**

Run:

```bash
npm run test:ci -- src/app/components/sliders/__tests__/GallerySlider.test.jsx --runInBand
```

Expected: FAIL because the old component still renders `.thumbnail-gallery`, uses “View Gallery”, does not normalize media, and does not open a lightbox.

- [x] **Step 3: Simplify `GallerySlider` around one Swiper and the lightbox**

Make these implementation changes:

```jsx
'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import MediaImage from '../MediaImage';
import GalleryLightbox from './GalleryLightbox';
import { normalizeGalleryMedia } from './galleryMedia';
import '@/app/styles/swiper.css';

const GallerySlider = ({ data, classNames = '', navColor = '#588f7a' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = normalizeGalleryMedia(data);

  if (images.length === 0) return null;

  return (
    <div className={`gallery_slider select-none ${classNames}`}>
      <Swiper
        style={{
          '--swiper-navigation-color': navColor,
          '--swiper-pagination-color': navColor,
        }}
        loop={false}
        watchOverflow
        spaceBetween={6}
        navigation={images.length > 1}
        watchSlidesProgress
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        modules={[Navigation]}
        breakpoints={{
          450: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1440: { slidesPerView: 3 },
        }}
        className="main-slider relative w-full has-[.swiper-slide-active]:odd:rounded-xl"
      >
        {images.map((image) => (
          <SwiperSlide key={image.src} className="group overflow-hidden">
            <MediaImage
              loading="lazy"
              src={image.src}
              alt={image.alt}
              width={960}
              height={640}
              sizes="(min-width: 1440px) 22vw, (min-width: 640px) 44vw, 100vw"
              className="h-[240px] w-full max-w-full object-cover transition-transform duration-500 ease-[var(--weelp-ease-out)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100 xs:max-w-80 sm:h-[280px] md:h-[280px] lg:h-[400px]"
            />
          </SwiperSlide>
        ))}

        {images.length > 1 ? <GalleryLightbox images={images} initialIndex={activeIndex} /> : null}
      </Swiper>
    </div>
  );
};

export default GallerySlider;
```

Remove the `collapseHiddenThumbnails` prop, `showGallery`, `thumbsSwiper`, `FreeMode`, `Thumbs`, `ProductGalleryAnimation`, the old double-click handler, and the entire `.thumbnail-gallery` tree. Existing callers may continue passing `collapseHiddenThumbnails`; React ignores the unused destructured property, so consumers do not require coordinated edits.

- [x] **Step 4: Run all focused gallery tests together**

Run:

```bash
npm run test:ci -- \
  src/app/components/sliders/__tests__/galleryMedia.test.js \
  src/app/components/sliders/__tests__/GalleryLightbox.test.jsx \
  src/app/components/sliders/__tests__/GallerySlider.test.jsx \
  --runInBand
```

Expected: PASS for all gallery suites.

### Task 4: Complete project review and verification gates

**Files:**

- Review all six files in the file map.
- Verify `src/app/components/Pages/FRONT_END/city/CityHeroBanner.jsx` without changing it unless browser testing exposes a layout defect.

- [x] **Step 1: Run the required error-handling review**

Check these explicit paths:

- invalid media is excluded before counting;
- an empty normalized array renders nothing;
- one image renders without dead navigation or a gallery trigger;
- the modal opening index is clamped to the valid range;
- all lightbox navigation wraps without producing an undefined image.

- [x] **Step 2: Run static and focused automated checks**

Run:

```bash
npm run type-check
npm run lint
npm run test:ci -- \
  src/app/components/sliders/__tests__/galleryMedia.test.js \
  src/app/components/sliders/__tests__/GalleryLightbox.test.jsx \
  src/app/components/sliders/__tests__/GallerySlider.test.jsx \
  src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/BannerSection.test.jsx \
  src/app/components/Pages/FRONT_END/singleblog/__tests__/BannerSection.test.jsx \
  --runInBand
git diff --check
```

Expected: every command exits 0.

- [x] **Step 3: Dispatch the mandatory code-review agent**

Ask the reviewer to compare the implementation against:

- `docs/superpowers/specs/2026-07-25-city-gallery-lightbox-design.md`;
- this plan;
- Next.js client-component boundaries;
- accessibility and keyboard behavior;
- shared slider consumers;
- focused test coverage.

Address every critical or high-confidence correctness finding, re-run the focused tests, and re-dispatch review until no critical findings remain.

- [x] **Step 4: Run the required simplify pass**

Use the project’s `simplify` skill if available. If it is unavailable, record that fact and perform the equivalent inline review: remove dead state/imports, collapse duplicated navigation logic, preserve component boundaries, and avoid broad refactors.

- [x] **Step 5: Verify in the existing visible headed browser**

Open `http://localhost:3000/cities/dubai` in the named headed session and verify:

1. The main slider remains visually unchanged.
2. No thumbnail gallery or reserved space appears beneath it.
3. The action reads “See all 3 photos”.
4. The modal opens on the current inline photo.
5. Previous/next buttons, thumbnails, ArrowLeft, ArrowRight, Escape, overlay close, and focus return work.
6. At a mobile viewport, the dialog fits within the visible height and the thumbnail rail scrolls horizontally.
7. Browser console and failed network requests show no new gallery errors.

- [x] **Step 6: Re-run final verification after any review or browser fixes**

Run:

```bash
npm run type-check
npm run lint
npm run test:ci -- \
  src/app/components/sliders/__tests__/galleryMedia.test.js \
  src/app/components/sliders/__tests__/GalleryLightbox.test.jsx \
  src/app/components/sliders/__tests__/GallerySlider.test.jsx \
  src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/BannerSection.test.jsx \
  src/app/components/Pages/FRONT_END/singleblog/__tests__/BannerSection.test.jsx \
  --runInBand
git diff --check
git status --short
```

Expected: all checks exit 0; status contains only the intended gallery implementation and plan files.

- [x] **Step 7: Commit and push the verified implementation to `main`**

Only after code review, simplify, static checks, tests, and visible-browser verification:

```bash
git add \
  docs/superpowers/plans/2026-07-25-city-gallery-lightbox.md \
  src/app/components/sliders/galleryMedia.js \
  src/app/components/sliders/GalleryLightbox.jsx \
  src/app/components/sliders/GallerySlider.jsx \
  src/app/components/sliders/__tests__/galleryMedia.test.js \
  src/app/components/sliders/__tests__/GalleryLightbox.test.jsx \
  src/app/components/sliders/__tests__/GallerySlider.test.jsx
git commit -m "feat: replace duplicate gallery with lightbox"
git push origin main
```

If review or browser verification changes another scoped file such as `CityHeroBanner.jsx`, add that exact file to the staging command after reviewing its diff.

Expected: the commit lands on local `main`, and `origin/main` advances to the verified commit.
