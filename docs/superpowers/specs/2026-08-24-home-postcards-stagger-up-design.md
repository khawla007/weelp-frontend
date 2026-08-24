# Home Postcards Stagger Up — Design

**Date:** 2026-08-24
**Status:** approved

## What this changes

The main homepage's `Postcards from travelers.` section will receive a one-time entrance designed for testimonial cards. Its heading will use the existing lift reveal, while the cards will rise 16 pixels, fade in, and settle from `scale(0.985)` to `scale(1)` in a short stagger.

This is an animation-only change. Review data, testimonial content, card styling, responsive breakpoints, continuous autoplay, loop behavior, spacing, and empty-review fallback behavior remain unchanged.

## Chosen approach

`TestimonialSection` is shared by the main homepage and Home Gold. The new treatment will remain opt-in:

- the main homepage passes `entrance="stagger-up"`;
- `TestimonialSection` keeps its outer `Reveal` as the single observer when the option is enabled;
- the heading becomes a marked plain heading that reads the parent reveal state instead of creating a second observer;
- `TestmonialSlider` receives the entrance value and skips its own observer because the parent owns the trigger;
- Home Gold omits the option and retains its existing section, heading, and slider reveal behavior.

This creates one synchronized intersection event without widening the rollout to another route.

## Entrance sequence

When the section reaches the existing reveal threshold:

1. `Postcards from travelers.` lifts and fades into place using the current heading reveal timing.
2. Testimonial slides begin 16 pixels below their final positions at zero opacity and `scale(0.985)`. This stays within the carousel wrapper's existing 16-pixel vertical buffer, preventing the vertical entrance from creating an internal scrollbar.
3. Slides settle over 800 milliseconds with 100-millisecond delays.
4. The delay index caps at three, giving the four possible desktop cards delays of 0, 100, 200, and 300 milliseconds while ensuring later or off-screen slides finish promptly.

The reveal runs once. Scrolling back, Swiper loop changes, and continuous autoplay do not replay it.

## Slider interaction

Swiper continues to translate its wrapper horizontally at its existing 8000-millisecond autoplay speed. The entrance affects individual slide elements vertically, so it does not replace or alter the wrapper transform.

Autoplay starts, pauses on hover, disables after interaction, and respects the existing reduced-motion JavaScript exactly as it does today. The entrance does not pause, restart, or synchronize autoplay because that would change slider behavior rather than only presentation.

## Motion accessibility

Under `prefers-reduced-motion: reduce`, the marked heading and every testimonial slide render immediately with full opacity, no transform, no animation, no delay, and no retained compositor hint. The slider's existing reduced-motion behavior continues to disable autoplay and set its transition speed to zero.

## Alternatives considered

Making `stagger-up` the default inside `TestimonialSection` would also change Home Gold. That broader rollout is outside this task.

Reusing `stagger-right` would require less new CSS, but a third consecutive horizontal card wave would feel mechanical and would compete visually with this slider's continuous horizontal travel. The upward entrance creates continuity through timing while differentiating personal stories from catalog browsing.

Keeping the three existing observers and staggering inside the slider would allow the heading and cards to trigger at different intersection samples. A single section observer gives the intended coordinated sequence.

## Verification

Tests will verify that:

- the main homepage opts the testimonial section into `stagger-up`;
- Home Gold remains unconfigured;
- the opted-in section exposes one observer plus scoped heading and slider hooks;
- the default component structure retains its independent heading and slider reveals;
- testimonial slide delay indexes cap at three;
- the CSS contract keeps the 16-pixel keyframe and pending transform within the carousel wrapper's vertical buffer, with 800/100-millisecond timing and a reduced-motion reset.

After focused tests, type-check, and lint, a visible headed browser at `http://localhost:3000` will verify the pending and shown states, desktop and mobile card timing, autoplay continuity, one-time playback, reduced motion, document overflow, and browser errors.
