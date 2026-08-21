# About FAQ Journey Animation Design

**Date:** 2026-08-21  
**Status:** Approved  
**Supersedes:** `2026-08-21-about-faq-cinematic-background-design.md`

## Why the direction changed

The cinematic mountain footage works technically, but it gives the FAQ the visual character of a video-editing portfolio. The About page needs motion that feels native to a travel-booking product and supports the FAQ instead of competing with it.

The replacement is a calm illustrated journey scene: a muted mountain landscape, one route drawing toward a destination pin, and nearly imperceptible cloud drift. It preserves the travel atmosphere without behaving like a showreel.

## Visual design

- Keep the existing full-width FAQ background placement and container-constrained FAQ card.
- Preserve the website spacing scale: 96px desktop, 64px tablet, and 40px mobile beneath the FAQ card.
- Use a custom vector landscape with stationary mountain and terrain layers.
- Draw one thin route in the existing Weelp gold accent toward a single destination pin.
- Add one translucent cloud with slow horizontal drift.
- Do not include a moving traveler, airplane, camera movement, large travel icons, or decorative text.
- Keep the FAQ heading and card above the illustration as the visual priority.
- Use muted natural greens in light mode and deeper sage terrain in dark mode.
- Preserve the current responsive composition and crop the vector scene intentionally at each breakpoint.

## Motion behavior

The route draws slowly from left to right, pauses at the destination pin, and resets softly before repeating. Cloud drift is slower and lower contrast than the route. Both loops remain calm and asynchronous so the background does not feel mechanical.

Animation begins only when the section is near or inside the viewport and pauses when the section leaves the viewport. It does not respond to pointer movement, scrolling speed, or FAQ interaction.

When `prefers-reduced-motion: reduce` is active, the final completed route and destination pin remain visible with no animation. The same static composition is the fallback when observers or CSS animation are unavailable.

## Component design

Create a focused `FaqJourneyAnimation` component containing the decorative SVG. It owns only the scene markup and visibility state. `AboutFAQ` continues to own the FAQ content and accordion behavior.

The scene is decorative and must use `aria-hidden="true"`. It introduces no focusable elements, controls, narration, or semantic labels. CSS module styles own the light/dark palette, responsive framing, route drawing, cloud drift, and reduced-motion behavior.

No Rive, Lottie, GIF, video, canvas, or third-party animation runtime is required. Inline SVG and CSS keep the result sharp, themeable, small, and dependency-free.

## Removing the rejected video direction

Remove the uncommitted cinematic-background implementation completely:

- responsive WebM and MP4 assets;
- the FFmpeg build pipeline and its tests;
- `ffmpeg-static` and video-related package scripts;
- Pexels attribution documentation;
- the video component and video-specific tests;
- poster/video/tint CSS that is no longer used.

The earlier approved video design remains in history for decision traceability, but this specification is the active direction.

## Verification

Automated coverage must verify:

- the decorative SVG renders without video elements or requests;
- reduced motion produces the finished static route;
- visibility changes pause and resume animation without remounting the FAQ;
- the scene introduces no accessible or focusable content;
- FAQ interactions and content remain unchanged;
- 96/64/40px spacing and full-width background geometry remain intact.

Visible-browser verification on local `/about-us` must cover desktop, tablet, and mobile in light and dark modes. It must confirm route pacing, crop quality, FAQ readability, zero horizontal overflow, reduced-motion behavior, and that the complete desktop FAQ composition remains visible beneath the site header.
