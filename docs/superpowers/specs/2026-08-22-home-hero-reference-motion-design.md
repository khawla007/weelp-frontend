# Home Hero Reference Motion — Design

**Date:** 2026-08-22  
**Status:** approved design, pending implementation plan  
**Reference:** `https://demo.casethemes.net/steelnova/`

## What this changes

The homepage hero will adopt the reference site's entrance rhythm and primary-button hover feel. The change is limited to motion: Weelp's existing layout, copy, image, spacing, responsive behavior, and color palette remain unchanged.

The reference inspection found three defining behaviors:

- the headline resolves character by character from blurred and transparent to sharp;
- supporting hero elements rise and fade in as a short sequence;
- the primary button reverses a directional color overlay while its icon rotates over 300 milliseconds.

## Entrance sequence

The implementation stays CSS-first so the entrance begins with the server-rendered first paint instead of waiting for hydration. No animation dependency will be added.

The existing hero shell fade remains. Inside it:

1. The eyebrow rises and fades in.
2. `Find your next` and `escape` reveal character by character. Each visible character starts slightly below its final position with opacity at zero and a soft blur, then resolves over roughly 700 milliseconds. A short per-character stagger creates the reference's travelling reveal without changing either line's typography or position.
3. The subtitle rises and fades in.
4. The complete search panel rises and fades in as one object so its popovers are not clipped.
5. The trust row rises and fades in last.

Word-level wrappers preserve the current wrapping behavior. The animated character spans are hidden from assistive technology, while the existing readable text is retained through an accessible label. Spaces and line boundaries remain explicit so the rendered wording does not change.

## Search button hover

Only the homepage pill variant's `Search escapes` submit button receives the new treatment. Other instances of the shared search component remain unchanged.

The button keeps its current sage palette, dimensions, label, search icon, border, shadow, and focus ring. A same-palette directional overlay transitions to its reversed direction over 300 milliseconds. At the same time, the existing search icon rotates 45 degrees. The text stays fixed, so the hover does not move the button or alter layout.

Keyboard `focus-visible` receives the same overlay and icon state in addition to the existing focus ring. The interaction does not run for a disabled or searching button.

## Implementation boundaries

The expected code surface is deliberately small:

- `HeroSection.jsx` gains accessible character wrappers and adjusted motion hooks.
- `ActivityItinerarySearch.jsx` gains a homepage-only class and stable inner spans for the button overlay and icon motion.
- `globals.css` defines the character reveal and the scoped button interaction alongside the existing hero-motion rules.
- Existing focused tests are extended to lock the markup, scope, and motion contracts.

No hero measurements, Tailwind layout utilities, theme tokens, asset URLs, navigation behavior, form logic, or search behavior will change.

## Motion accessibility

The existing `prefers-reduced-motion: reduce` contract will be extended to the new character and button hooks. Reduced-motion users see the final sharp text immediately, with no translation, blur, stagger, overlay transition, or icon rotation. Focus indication remains available.

## Failure paths worth knowing

- **Hydration or late replay:** avoided by server-rendered character markup and CSS-at-paint animation.
- **Headline wrapping changes:** prevented by grouping characters inside the current words and preserving the two existing title lines.
- **Search popover clipping:** prevented by continuing to animate the complete search panel without adding an overflow clip around it.
- **Shared search regression:** prevented by scoping the hover class to the homepage pill button only.
- **Duplicate screen-reader text:** prevented by exposing one accessible label and marking decorative character spans `aria-hidden`.

## Verification

Focused component tests will verify the headline's accessible label and character hooks, the unchanged hero hierarchy, the homepage-only search-button hook, and the stable icon/text wrappers. CSS contract coverage will verify the blur reveal, 300-millisecond hover transition, 45-degree icon state, and reduced-motion reset.

After type-check, lint, and focused tests pass, a visible headed browser at `http://localhost:3000` will verify the entrance on reload, the mouse hover, keyboard focus, responsive behavior, reduced motion, and a clean console. The reference page will remain open for side-by-side timing comparison.
