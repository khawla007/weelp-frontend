# Home Gold Design

## What we are testing

Weelp's dark theme already uses deep forest surfaces, sage text, and quiet green borders. The `/home-gold` experiment tests whether a muted antique-gold edge can add a more luxurious finish without turning the homepage into a different brand.

The existing `/` route must not change. The experiment will live at `/home-gold` so both versions can be compared in the same local environment.

## Chosen visual direction

The selected direction is **Gold Edge**. Gold acts as the structural edge language rather than a fill colour:

- meaningful containers and controls receive thin antique-gold borders;
- normal borders use restrained opacity;
- hover, focus, and selected states use a clearer gold;
- deep green remains the surface colour;
- sage remains the default text colour;
- photography, spacing, typography, content, and interactions remain unchanged;
- gold text is limited to small cues such as ratings or selected details when an existing component already exposes an accent role.

Two focused treatments keep the hero and photography polished without feeling over-framed:

- Top Destinations image cards use the same restrained antique-gold edge as the other cards. Hover strengthens that edge and adds a compact, low-opacity gold depth shadow while preserving the existing image scale treatment. The hover transition must retain the card's ring layers so no white flash or edge jump appears, and its negative spread must keep the light under the active card instead of illuminating neighboring cards.
- The non-interactive “Plan calmer escapes” eyebrow uses the same restrained antique-gold border as other hero controls.

The core colour is `#C2A35B`. Border treatments derive from it with opacity instead of introducing several unrelated yellow tones.

## Route and composition

The new App Router page will be available at `/home-gold`. It will use the same server-side data sources, fallback behaviour, section ordering, and shared homepage components as `/`.

The homepage composition and data loading should have one owner. The route should not contain a copied version of the existing homepage implementation that can drift later. A shared home-page component or render function will accept an optional presentation variant, with the default preserving the current homepage and `gold` activating the experiment.

## Theme isolation

The gold treatment will be scoped to a wrapper owned by `/home-gold`. That wrapper will override the existing semantic border variables used by homepage components, including the general border, homepage border, card border, and search border roles.

Interactive panels rendered through portals, including search popovers and mobile overlays, must receive the same scoped variables. A route-aware client bridge may mirror the gold class onto the document body while `/home-gold` is active, then remove it during navigation or unmount. This bridge must not leave gold tokens active on `/` or another route.

The original root theme tokens in `globals.css` will remain unchanged. Components outside the gold wrapper, including the regular homepage, will continue to resolve the current green border values.

Where a shared component uses a fixed border colour instead of a semantic variable, it may receive a narrowly scoped descendant override under the gold wrapper. The implementation must not replace every visible line with bright gold. Dividers and low-priority decoration should remain quieter than interactive boundaries.

The Gold Edge treatment is dark-mode-only. When `/home-gold` switches to light mode, it must resolve the same border, ring, shadow, surface, and text tokens as the canonical light homepage. The route hook may remain present for theme switching, but it must not produce any gold border or shadow until the `.dark` theme class is active.

## Behaviour and failure paths

`/home-gold` will preserve the homepage's current loading and failure behaviour:

- activity, destination, review, and blog requests run concurrently;
- successful data renders the corresponding shared section;
- empty or failed responses render the existing section fallbacks;
- all links, sliders, search controls, theme switching, and responsive layouts continue to work as they do on `/`.

No backend or API changes are required.

## Accessibility

Gold borders are supplementary visual treatment, not the only indicator of state. Existing labels, icons, text, and focus behaviour remain in place. Focus and selected states should use a sufficiently visible gold edge against the deep forest surface, while decorative borders may use lower opacity.

The implementation must retain reduced-motion behaviour and must not add animated layout properties.

## Verification

Automated coverage will confirm:

- `/home-gold` renders the shared homepage content;
- the gold variant applies its scoped theme hook;
- the regular homepage does not receive that hook;
- existing homepage empty and error paths remain unchanged.

After type-checking, linting, and focused tests pass, both `/home-gold` and `/` will be inspected in the visible local browser at desktop and mobile widths. The review will check border consistency, readable hierarchy, hover and focus states, dark-mode appearance, light-mode parity with `/`, and isolation from the original homepage.

The visible review will specifically confirm that, in dark mode, Top Destinations cards use the standard restrained gold edge at rest, strengthen that edge smoothly on hover, and show a compact downward gold depth shadow without a white flash, edge jump, carousel clipping, or visible light spill onto neighboring cards. The “Plan calmer escapes” eyebrow uses the same restrained gold edge. In light mode, the same cards, eyebrow, controls, and focus states must match the canonical light homepage with no gold border or shadow.

## Out of scope

- changing the production homepage;
- changing backend data or APIs;
- redesigning layouts or rewriting homepage copy;
- adding metallic gradients, thick gold frames, gold-filled cards, or gold primary surfaces;
- applying the gold theme to routes other than `/home-gold`.
