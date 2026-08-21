# About FAQ Cinematic Background Design

**Date:** 2026-08-21

## What this design changes

The About page FAQ currently uses a static, full-width destination image behind the FAQ card. The SteelNova demo gives the same area life through a chimney animation, but that subject does not belong on a travel website. Weelp will replace the static treatment with a calm cinematic mountain loop: slow clouds, soft changing sunlight, gentle camera drift, and one distant traveler.

The animation should make the section feel alive without competing with the questions. The FAQ heading, card, accordion controls, and approved responsive spacing remain unchanged.

## The experience

The background uses a seamless 10–14 second licensed stock video. It shows a scenic mountain overlook with one distant traveler positioned toward the right side of the frame. The movement is natural and restrained:

- slow cloud movement;
- subtle changes in sunlight;
- a gentle camera drift of roughly two to three percent;
- no particles, route graphics, floating controls, or artificial parallax.

On desktop, the video occupies the existing full-width background layer. It starts behind the lower part of the stationary FAQ card and reaches the section boundary. The approved space below the card remains 96px while the video itself has no trailing gap.

Tablet and mobile preserve the current stacked composition. The image/video and card touch with no gap, followed by 64px and 40px of space below the card respectively. A separately cropped mobile source keeps the traveler and mountain in frame instead of relying on an arbitrary `object-cover` crop.

## Component boundary

`AboutFAQ` remains responsible for FAQ data and accordion state. A focused `FaqCinematicBackground` component is added beside it under the About components folder. The background component owns:

- responsive video sources;
- near-viewport loading;
- play and pause behavior;
- the poster-to-video reveal;
- reduced-motion and failure fallbacks.

This keeps media lifecycle state out of the accordion and avoids turning `AboutFAQ` into a mixed-responsibility component. The cinematic background is not generalized into a site-wide abstraction because this design has one approved use.

## Media lifecycle

The current optimized destination image remains visible first and acts as the video poster. The video starts with `preload="none"` so the below-the-fold section does not compete with initial page content.

An `IntersectionObserver` begins loading when the FAQ approaches the viewport. When the video can play, it fades over the poster with a short opacity transition. Playback pauses after the section leaves the viewport and resumes when it returns.

The video element uses native `muted`, `loop`, and `playsInline` behavior. It has no audio track and no controls. The footage is decorative, so it is hidden from the accessibility tree; the existing FAQ content continues to carry all meaning.

## Fallback paths

The poster remains the final rendered state when any of these conditions apply:

- the user prefers reduced motion;
- data-saving mode is enabled;
- the browser rejects autoplay;
- a source cannot load or decode;
- `IntersectionObserver` is unavailable.

Playback rejection and media errors do not show an alert or broken-media state because the existing poster is a complete visual fallback. The component simply keeps the poster visible. This also prevents layout shift and blank background frames.

## Theme treatment

Light and dark mode use the same footage. A restrained theme-aware overlay adjusts the video rather than swapping assets. The light theme receives only enough tonal balancing to keep the scene cohesive; the dark theme receives a slightly stronger tint. The FAQ card itself remains the primary readability surface.

## Asset requirements

The chosen footage must have a license that permits web and commercial use. Its source and license are recorded alongside the final asset decision.

- seamless 10–14 second loop;
- 24 frames per second;
- no audio track;
- landscape desktop crop in WebM with MP4 fallback;
- dedicated tablet/mobile crop in WebM with MP4 fallback;
- desktop WebM target of roughly 1.5–2 MB;
- mobile WebM target of roughly 700 KB–1.2 MB.

Compression may exceed those targets only when a lower size introduces visible banding, block artifacts, or an obvious loop seam. Only the source selected by the browser should be downloaded.

## Motion accessibility

Reduced-motion users receive the poster with no fade, zoom, or video playback. The design does not rely on motion to explain content or communicate state. Keyboard navigation, focus visibility, accordion semantics, and the existing one-open-item behavior remain unchanged.

## Verification

Automated coverage will verify:

- responsive WebM and MP4 source declarations;
- `muted`, `loop`, and `playsInline` behavior;
- near-viewport loading and off-screen pause;
- reduced-motion and save-data poster fallback;
- rejected playback and media-error fallback;
- unchanged FAQ accordion interaction.

Visible browser verification will cover desktop, tablet, and mobile crops in light and dark mode. It will confirm that the card stays stationary, the loop has no visible jump, the traveler remains away from the card, horizontal overflow stays at zero, and spacing remains 96px, 64px, and 40px below the card with no gap below the desktop video.

## Outside this scope

This work does not redesign the FAQ layout, change FAQ copy, add playback controls, animate the FAQ card, or introduce motion to other About page sections. Selecting and licensing the stock footage is part of implementation preparation; changing the approved scene or motion direction requires a design update first.
