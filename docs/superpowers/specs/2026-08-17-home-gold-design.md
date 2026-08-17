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

The core colour is `#C2A35B`. Border treatments derive from it with opacity instead of introducing several unrelated yellow tones.

## Route and composition

The new App Router page will be available at `/home-gold`. It will use the same server-side data sources, fallback behaviour, section ordering, and shared homepage components as `/`.

The homepage composition and data loading should have one owner. The route should not contain a copied version of the existing homepage implementation that can drift later. A shared home-page component or render function will accept an optional presentation variant, with the default preserving the current homepage and `gold` activating the experiment.

## Theme isolation

The gold treatment will be scoped to a wrapper owned by `/home-gold`. That wrapper will override the existing semantic border variables used by homepage components, including the general border, homepage border, card border, and search border roles.

Interactive panels rendered through portals, including search popovers and mobile overlays, must receive the same scoped variables. A route-aware client bridge may mirror the gold class onto the document body while `/home-gold` is active, then remove it during navigation or unmount. This bridge must not leave gold tokens active on `/` or another route.

The original root theme tokens in `globals.css` will remain unchanged. Components outside the gold wrapper, including the regular homepage, will continue to resolve the current green border values.

Where a shared component uses a fixed border colour instead of a semantic variable, it may receive a narrowly scoped descendant override under the gold wrapper. The implementation must not replace every visible line with bright gold. Dividers and low-priority decoration should remain quieter than interactive boundaries.

The Gold Edge treatment remains active when the route's theme toggle switches to light mode, so `/home-gold` is always recognisable as the experiment. Dark mode is the primary acceptance target; light mode must remain readable and usable without receiving new surface or text colours.

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

After type-checking, linting, and focused tests pass, both `/home-gold` and `/` will be inspected in the visible local browser at desktop and mobile widths. The review will check border consistency, readable hierarchy, hover and focus states, dark-mode appearance, and isolation from the original homepage.

## Out of scope

- changing the production homepage;
- changing backend data or APIs;
- redesigning layouts or rewriting homepage copy;
- adding metallic gradients, thick gold frames, gold-filled cards, or gold primary surfaces;
- applying the gold theme to routes other than `/home-gold`.
