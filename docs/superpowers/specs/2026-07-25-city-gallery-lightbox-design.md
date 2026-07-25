# City Gallery Lightbox Design

## What this change solves

The single-city hero currently uses the same media collection twice: once in the main slider and again in an expandable thumbnail slider. On Dubai, both surfaces contain the same three images, so “View Gallery” reveals no new content and does not explain what will happen.

The main slider already handles quick browsing well. The gallery action should therefore serve a different purpose: opening an immersive view of every available city photo.

## Agreed experience

The main slider stays in place with its current responsive slide counts and navigation behavior. The expandable gallery beneath it is removed, including the empty space and reveal animation it creates.

The overlay action becomes **“See all N photos”**, where `N` is the number of valid media records supplied to the slider. Selecting it opens a modal lightbox that:

- starts on the image currently active in the main slider;
- displays one large image at a time;
- provides previous and next controls when more than one image exists;
- shows the current position as “N of total”;
- includes a compact thumbnail rail for direct selection when several images exist;
- closes through its visible close action, Escape, or the modal overlay;
- traps focus while open and returns focus to the trigger after closing.

The lightbox uses the existing Radix dialog primitives so focus management, Escape handling, and screen-reader semantics follow established project patterns.

## Sparse and incomplete media

Media records without a usable `url` or `image` value are excluded before rendering or counting.

- No valid images: render no gallery slider.
- One valid image: render the image without slider arrows or the “See all” action.
- Two or more valid images: render the slider and counted lightbox action.

The UI does not invent or repeat images to make the gallery look fuller. Dubai currently has three unique media records; adding more city media through the dashboard automatically increases the count and the lightbox contents.

## Component boundaries

`GallerySlider` remains responsible for the inline Swiper and active-image state. A focused `GalleryLightbox` component owns the modal presentation and lightbox navigation. Both receive the same normalized media array, which keeps counting, labels, and displayed images consistent.

The shared slider is also used by product and blog pages. The counted lightbox replaces the duplicate expandable gallery consistently on those consumers rather than leaving the old ambiguous behavior in some contexts. Copy remains generic—“See all N photos”—so it fits cities, activities, packages, itineraries, and blogs.

## Failure paths worth knowing

Broken image requests retain the browser’s normal broken-image behavior; this change does not alter media delivery. Navigation wraps from the last image to the first and from the first to the last inside the lightbox, while the inline slider keeps its current non-looping behavior.

Updating the active lightbox image must not unexpectedly move the inline slider. The inline slider’s active index only determines which photo the lightbox opens on.

## Verification

Focused component tests cover media normalization, singular/plural button text, single-image behavior, opening on the active slide, lightbox navigation, selection from thumbnails, closing behavior, and removal of the old inline thumbnail gallery.

After implementation, the frontend type-check and lint commands must pass. A visible headed browser check on the Dubai city page verifies the overlay label, absence of the under-slider gallery, modal opening, navigation, keyboard close, focus return, and desktop/mobile layouts.
