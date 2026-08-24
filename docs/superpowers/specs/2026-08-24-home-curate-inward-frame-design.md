# Home Curate Inward Frame — Design

**Date:** 2026-08-24
**Status:** awaiting written-spec review

## What this changes

The main homepage's Curate section will receive a one-time, inward-framing entrance. The traveler faces and supporting text will appear first, the mirrored side patterns will slide inward, the horizontal lines will draw toward the center, and the Curate button will settle into place last.

This is an animation-only change. Copy, images, colors, light and dark theme tones, layout, spacing, button styling, navigation, and the `/home-gold` route remain unchanged.

## Chosen approach

`WanderersBanner` is shared by the main homepage and Home Gold. The new treatment will remain opt-in:

- the main homepage passes `entrance="inward-frame"`;
- Home Gold omits the option and preserves its current reveal behavior;
- the opted-in banner uses its outer `Reveal` as the one-time section trigger;
- marked descendants read the parent reveal state instead of running independent entrance timing;
- scoped CSS owns the choreography, using only opacity and transforms.

The side SVGs already use transforms for vertical centering and mirroring. Their horizontal entrance will therefore run on lightweight wrappers, preserving the existing SVG geometry instead of overwriting those transforms.

## Entrance sequence

When the section reaches the existing reveal threshold:

1. The six circular traveler faces and `Be among 400+ other wanderers!` move up 12 pixels and fade in over 700 milliseconds with no delay.
2. The left and right patterns fade in while moving 36 pixels inward from their respective viewport edges. They settle over 850 milliseconds after an 80-millisecond delay.
3. Both horizontal lines draw from the outer edges toward the Curate button using `scaleX(0)` to `scaleX(1)`. The left line uses a left transform origin and the right line uses a right transform origin. They settle over 700 milliseconds after a 160-millisecond delay.
4. The Curate link fades in, rises 14 pixels, and settles from `scale(0.97)` to `scale(1)` over 700 milliseconds after a 260-millisecond delay.

Every movement uses the existing exponential `--weelp-ease-out` curve. There is no bounce, elastic easing, continuous motion, or replay when the visitor scrolls back.

## Responsive behavior

At `md` and above, the complete faces, text, patterns, lines, and button choreography runs.

Below `md`, the side patterns remain hidden exactly as they are today. Faces and text still fade up, both lines still draw inward, and the button still settles last. Timings remain consistent across breakpoints so the section retains the homepage's established 850-millisecond rhythm.

## Interaction and accessibility

The animation does not block the Curate link. Its existing hover, focus, skewed background, hit area, and `/cities` destination remain unchanged.

Under `prefers-reduced-motion: reduce`, all marked elements render immediately at full opacity and their final transform. Animation delays, keyframes, and retained compositor hints are removed. The decorative SVGs and lines remain `aria-hidden`, while the button keeps its normal keyboard focus treatment.

## Alternatives considered

A button-first, center-out reveal would make the CTA appear sooner and then send the lines toward the patterns. It is more UI-like, but it weakens the framing gesture and makes the decorative elements feel secondary.

A simultaneous fade and lift would require less CSS, but it would closely repeat the current group reveal and would not explain the visual relationship between the patterns, lines, and central action.

The chosen outer-to-center sequence guides the eye naturally toward Curate while remaining calm enough for Weelp's editorial brand.

## Verification

Tests will verify that:

- the main homepage opts the banner into `inward-frame`;
- Home Gold remains unconfigured;
- the opt-in markup exposes hooks for the top content, left and right pattern wrappers, left and right lines, and button;
- the default banner retains its existing reveal structure;
- CSS contracts preserve the 700/850-millisecond durations, 80/160/260-millisecond delays, directional transforms, line origins, and exponential easing;
- reduced motion removes opacity, transform, animation, delay, and compositor hints.

After focused tests, type-check, and lint, a visible headed browser at `http://localhost:3000` will verify desktop and mobile choreography, light and dark themes, one-time playback, exact route scope, Curate interaction, theme colors, document overflow, and browser errors.
