# About FAQ Journey Animation Design

**Date:** 2026-08-21

**Revised:** 2026-08-22

**Status:** Approved

**Supersedes:** `2026-08-21-about-faq-cinematic-background-design.md`

## Why the direction changed

The cinematic mountain footage works technically, but it gives the FAQ the visual character of a video-editing portfolio. The About page needs motion that feels native to a travel-booking product and supports the FAQ instead of competing with it.

The replacement is a calm illustrated journey scene: a muted mountain landscape, one double-lane road building toward a destination pin, a small car completing the journey, and nearly imperceptible cloud drift. It preserves the travel atmosphere without behaving like a showreel.

## Visual design

- Keep the existing full-width FAQ background placement and container-constrained FAQ card.
- Preserve the website spacing scale: 96px desktop, 64px tablet, and 40px mobile beneath the FAQ card.
- Use a custom vector landscape with stationary mountain and terrain layers.
- Construct one curved double-lane road with pale outer edges, a muted dark surface, and a restrained gold center divider.
- Place one small illustrated car on the road after its initial construction completes.
- Add one translucent cloud with slow horizontal drift.
- Do not include a moving traveler, airplane, camera movement, large travel icons, or decorative text.
- Keep the FAQ heading and card above the illustration as the visual priority.
- Use muted natural greens in light mode and deeper sage terrain in dark mode.
- Preserve the current responsive composition and crop the vector scene intentionally at each breakpoint.

## Motion behavior

The road constructs once from left to right when the scene first becomes active, then remains fully visible. After construction completes, the car travels along the finished road to the destination pin, rests briefly, and repeats without rebuilding or clearing the road. The pin pulses once when the car arrives. Cloud drift is slower and lower contrast than the vehicle sequence, keeping the motion calm rather than mechanical.

The car must remain small enough to read as a detail rather than a focal illustration. Its travel follows the center of the road, uses steady easing without bouncing, and includes a clear rest at the destination before returning to the starting point for the next loop. The reset happens without reversing down the road.

Animation begins only when the section is near or inside the viewport and pauses when the section leaves the viewport. It does not respond to pointer movement, scrolling speed, or FAQ interaction.

When `prefers-reduced-motion: reduce` is active, the completed road, parked car at the destination, and destination pin remain visible with no animation. The same static composition is the fallback when observers or CSS animation are unavailable.

## Component design

Create a focused `FaqJourneyAnimation` component containing the decorative SVG. It owns only the scene markup and visibility state. `AboutFAQ` continues to own the FAQ content and accordion behavior.

The scene is decorative and must use `aria-hidden="true"`. It introduces no focusable elements, controls, narration, or semantic labels. CSS module styles own the light/dark palette, road construction, car journey, pin pulse, cloud drift, responsive framing, and reduced-motion behavior.

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
- the road builds once and remains complete while the car journey repeats;
- the destination pin pulses only when the car arrives;
- reduced motion produces the finished static road with the car parked at the pin;
- visibility changes pause and resume animation without remounting the FAQ;
- the scene introduces no accessible or focusable content;
- FAQ interactions and content remain unchanged;
- 96/64/40px spacing and full-width background geometry remain intact.

Visible-browser verification on local `/about-us` must cover desktop, tablet, and mobile in light and dark modes. It must confirm the one-time road construction, repeating car journey, arrival-synchronized pin pulse, crop quality, FAQ readability, zero horizontal overflow, reduced-motion behavior, and that the complete desktop FAQ composition remains visible beneath the site header.
