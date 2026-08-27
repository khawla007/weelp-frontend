# Home Hero Ten Percent Slower — Design

**Date:** 2026-08-27  
**Status:** approved design

## What changes

The homepage hero will keep its current first-paint entrance and choreography while running exactly 10 percent slower. Every timing that controls the entrance rhythm will be multiplied by `1.10`, so the relative sequence remains unchanged.

- Headline reveal duration: `700ms` → `770ms`
- Per-character stagger: `35ms` → `38.5ms`
- Supporting-element duration: `850ms` → `935ms`
- Delayed supporting-element offset: `250ms` → `275ms`

The final headline character will finish after approximately `1.4245s`, compared with the current `1.295s`. Delayed supporting content will finish after `1.21s`, compared with the current `1.10s`.

## Boundaries

The animation still starts from the server-rendered first paint. Easing, opacity, blur, vertical travel, content order, layout, responsive behavior, and reduced-motion handling remain unchanged. No client-side animation controller or load gate will be reintroduced.

## Verification

Focused component and CSS tests will lock the revised timings. Type-check, lint, visible localhost reload, browser errors, overflow, and reduced-motion behavior will be checked after implementation.
