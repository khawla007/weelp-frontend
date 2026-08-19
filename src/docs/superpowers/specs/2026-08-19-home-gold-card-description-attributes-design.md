# Home-Gold Top-Activities Card — Description & Attributes

**Date:** 2026-08-19
**Scope:** `/home-gold` → Top Activities section → `GoldActivityCard`
**Related:** `2026-08-18-home-gold-top-activities-card-design.md` (base card redesign)

## Why

Redesigned card leaves a large vertical gap between title and the price/Explore row. The white space reads as "unfinished" rather than intentional breathing room. Content team has short descriptions and attributes already populated on activities but nothing surfaces them on cards. Add both to give the card scannable substance without breaking the redesign's calm.

## What ships

Two new render blocks between the title/rating row and the price row of `GoldActivityCard`:

1. **Short description** — one to two lines of muted body copy pulled from `activity.short_description`.
2. **Attribute row** — up to three attribute chips (icon + value only, label announced via `aria-label`/`title`) pulled from `activity.attributes`.

Both blocks are optional. If the data is missing the row is omitted entirely — no empty placeholders, no shifted layout.

## Data source

`GET /api/activities/featured-activities` already returns both fields:

- `short_description: string | null` — `PublicActivityController@getFeaturedActivities:172`
- `attributes: [{ name, attribute_value }]` — `PublicActivityController@getFeaturedActivities:182-187`

The only backend change is adding the attribute `slug` to that map so the frontend icon lookup keys on a stable identifier instead of the human-facing name.

## Backend change

**File:** `backend/app/Http/Controllers/Guest/PublicActivityController.php` (`getFeaturedActivities`, ~line 182)

```php
'attributes' => $activity->attributes->map(function ($attribute) {
    return [
        'slug' => $attribute->attribute->slug,      // NEW
        'name' => $attribute->attribute->name,
        'attribute_value' => $attribute->attribute_value,
    ];
}),
```

Nothing else on the backend moves. No migration. No new endpoint.

## Frontend changes

### 1. Icon map

New file `frontend/src/lib/attributeIcons.js`. Maps known attribute slugs to lucide-react icon components. Unknown slug → `Tag` fallback so a newly-added attribute type still renders, just without a bespoke glyph.

Initial slug coverage (verify against `attributes` table before shipping and extend as needed):

| slug                            | icon        |
| ------------------------------- | ----------- |
| `duration`                      | `Clock`     |
| `group-size`                    | `Users`     |
| `age`                           | `Baby`      |
| `language`                      | `Languages` |
| `physical-level` / `difficulty` | `Mountain`  |
| _fallback_                      | `Tag`       |

Export shape:

```js
export function getAttributeIcon(slug) {
  /* returns lucide component */
}
```

### 2. Product-to-card mapper

**File:** `frontend/src/lib/mapProductToItemCard.js`

Thread the two fields through `mapProductToItemCard`:

- `shortDescription: product.short_description ?? null`
- `attributes: Array.isArray(product.attributes) ? product.attributes.slice(0, 3) : []`

The `.slice(0, 3)` is the display cap. Backend order (creation order today) drives which three win. If content team later wants explicit ordering, the ordering source moves to the backend — the frontend keeps taking the first three verbatim.

### 3. Card component

**File:** `frontend/src/app/(frontend)/home-gold/GoldActivityCard.jsx`

Insert between the title/rating row (currently ends `GoldActivityCard.jsx:110`) and the `mt-4` price row (currently `GoldActivityCard.jsx:113`):

- `shortDescription` → `<p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{shortDescription}</p>` — only when truthy.
- `attributes.length > 0` → row of `<span>` chips: icon (`size-4 text-zinc-500 dark:text-zinc-400`, `aria-hidden`) + attribute value text. Wrapper: `mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600 dark:text-zinc-300`. Each chip's outer `<span>` gets `aria-label={\`${attribute.name}: ${attribute.attribute_value}\`}`and matching`title` so mouse and screen-reader users get the label even though it isn't printed.

The existing `flex-1` wrapper around the title already pushes the price row to the bottom, so the new blocks naturally consume the extra space without changing overall card height on data-rich cards. On data-poor cards (no description, no attributes) the layout is identical to today.

## Accessibility

- Icons render with `aria-hidden="true"`; the chip's `<span>` carries the full label as `aria-label` and `title` (path C from brainstorm).
- Description is a plain `<p>`, no ARIA needed.
- Colour contrast: `text-zinc-500` on the current `oklch(0.96 0.02 80)` background clears WCAG AA at 14px. Dark mode uses `zinc-400` on `oklch(0.17 0.03 155)` — also clears AA. Verify with the browser after implementation.

## Testing

**Unit — `GoldActivityCard.test.jsx`:**

- Renders description when `shortDescription` is present.
- Renders exactly the number of chips passed on `attributes` (0, 1, 2, 3).
- Chip's accessible name = `${attribute.name}: ${attribute.attribute_value}`.
- Description block absent when `shortDescription` is null.
- Attribute row absent when `attributes` is empty.

**Unit — `mapProductToItemCard` (add to existing test file if any, otherwise inline in card test):**

- Slices `attributes` to first three.
- Passes `shortDescription` through untouched.

**Integration — `GoldTopActivitiesSection.test.jsx`:**

- Verify a sample activity with description + attributes renders both blocks inside the carousel slide.

**Manual — browser (agent-browser after code change per CLAUDE.md):**

- `/home-gold` at 1440, 1024, 768, 375 viewports. Confirm cards do not overflow, chip row wraps sensibly on 375, description clamps to two lines on all sizes.
- Reduced-motion: card hover animations still respect existing motion-reduce rules.

## Out of scope

- Adding a dedicated `difficulty` column to `activities`. User confirmed a separate difficulty input already exists elsewhere and the attribute route is enough here.
- Admin-controlled attribute display ordering. Backend order is fine for launch.
- Adding an `icon` column to the `attributes` table. Frontend slug→icon map covers the current attribute vocabulary; revisit if the fallback icon starts showing on real cards.
- Any change to the itinerary/package variants of this card. Scope is `GoldActivityCard` only.

## Rollout

1. Backend patch (attribute slug in payload).
2. Frontend mapper + icon map + card render + tests.
3. `tsc --noEmit`, `npm run lint`, scoped jest for `home-gold/__tests__`.
4. Browser check per Testing section.
5. Code-review agent → `simplify` skill → commit → push `main` on both repos.
