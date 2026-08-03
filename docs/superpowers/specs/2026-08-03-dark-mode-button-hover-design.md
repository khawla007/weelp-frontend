# Dark-Mode Button Hover Design

## What this changes

Every enabled button in dark mode will use the hover treatment already present on the Dubai Tours controls: a soft sage shadow offset to the lower right, animated over 200 milliseconds. The treatment also applies to anchors that are visually constructed as buttons, while ordinary text and navigation links keep their existing hover behavior.

Light mode is outside this change.

## Interaction contract

The hover shadow is `4px 4px 15px rgba(88, 143, 122, 0.3)`. Eligible controls transition the same interaction properties as the Dubai Tours buttons over 200 milliseconds with the project's standard easing. Reduced-motion users receive the final hover style without an animated transition.

The rule covers:

- enabled native `button` elements, including icon, header, carousel, pagination, dialog, and form buttons;
- anchors with `role="button"`;
- anchors with an explicit border-box class;
- anchors using the established filled button surface classes `bg-primary` or `bg-weelp-sage-deep`.

The rule excludes:

- disabled native buttons and controls marked `aria-disabled="true"`;
- plain anchors that only look or behave like text links;
- light-mode controls.

## Implementation shape

The behavior belongs in `src/app/globals.css`, beside the existing site-wide dark button surface rules. A shared selector contract will define eligible controls once for their resting transition and once for `:hover`. This avoids editing individual pages and automatically covers future controls that follow the same semantics or established button styling.

The new hover rule changes only `box-shadow`. It does not replace a control's background, text, border, transform, or component-specific hover state. The shadow declaration uses sufficient cascade strength to remain consistent when existing utility classes also set a hover shadow.

## Verification

`src/app/__tests__/deepForestTheme.test.js` will lock down the dark-only selectors, disabled-state exclusions, transition timing, and exact shadow value. The existing dark theme contract tests must continue to pass.

After type-check and lint, the visible headed browser will verify representative controls on the Dubai city page and another page containing header or link-based button controls. Checks will confirm that enabled buttons receive the shadow, disabled buttons do not, button-shaped anchors receive it, and ordinary text links remain unchanged.
