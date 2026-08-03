# Dark-Mode Button Hover Design

## What this changes

Every enabled button in dark mode will use the hover treatment already present on the Dubai Tours controls: a soft sage shadow offset to the lower right, animated over 200 milliseconds. The treatment also applies to anchors that are visually constructed as buttons, while ordinary text and navigation links keep their existing hover behavior.

Light mode is outside this change.

## Interaction contract

The hover shadow is `4px 4px 15px rgba(88, 143, 122, 0.3)`. Eligible controls transition the same interaction properties as the Dubai Tours buttons over 200 milliseconds with the project's standard easing. Reduced-motion users receive the final hover style without an animated transition.

The rule covers:

- enabled native `button` elements, including icon, header, carousel, pagination, dialog, and form buttons;
- button-shaped anchors that opt in with `data-weelp-button-link`;
- anchors with `role="button"` or the established filled surface classes `bg-primary` and `bg-weelp-sage-deep`, retained as compatibility selectors.

The shared `Button` component adds `data-weelp-button-link` automatically when a non-`link` variant uses `asChild`. Direct button-shaped anchors add the same marker at their callsite. This semantic opt-in separates controls from anchors that merely share layout or border utilities.

The rule excludes:

- disabled native buttons and controls marked `aria-disabled="true"`;
- plain anchors that only look or behave like text links;
- card anchors and ordinary navigation entries, including bordered cards and mobile menu links without the marker;
- light-mode controls.

## Implementation shape

The dark hover behavior belongs in `src/app/globals.css`, beside the existing site-wide dark button surface rules. A shared selector contract defines eligible controls once for their resting transition and once for `:hover`. The implementation also spans the shared `Button` component and audited direct button-shaped anchor callsites so semantic intent is present in the rendered markup.

The new hover rule changes only `box-shadow`. It does not replace a control's background, text, border, transform, or component-specific hover state. The shadow declaration uses sufficient cascade strength to remain consistent when existing utility classes also set a hover shadow.

## Verification

`src/app/__tests__/deepForestTheme.test.js` locks down the dark-only selectors, disabled-state exclusions, transition timing, exact shadow value, representative DOM selection behavior, and exact marker counts for audited direct anchors. `src/components/ui/__tests__/button.test.jsx` verifies that non-link `Button asChild` anchors opt in while `variant="link"` anchors remain excluded. Component coverage for direct shared CTAs verifies their rendered markers. The existing dark theme contract tests must continue to pass.

After type-check and lint, the visible headed browser will verify representative controls on the Dubai city page and another page containing link-based button controls. Checks will confirm that enabled buttons and semantic marker anchors receive the shadow, while disabled controls, plain links, card anchors, and ordinary navigation links remain unchanged.
