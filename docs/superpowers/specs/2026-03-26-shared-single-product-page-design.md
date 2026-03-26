# Shared Single Product Page Components

**Date:** 2026-03-26
**Status:** Approved
**Scope:** Unify single activity, itinerary, and package pages into shared components

---

## Problem

The three single product pages (activity, itinerary, package) share ~90% identical code but are implemented as separate components with divergent styling:

- `TabSectionActivity` — updated with modern design (white bg, button-based tabs, 58/42 split, gradient sidebar with decorative image)
- `TabSectionIterenary` — old styling (border-2, ul/li tabs, 3/5 split, plain bg sidebar, no decorative image, typo "Itirenary")
- `TabSectionPackage` — same old styling as itinerary

The pen design (`Designs/singel-itinerary-page.pen`) shows that itinerary and package pages should match the activity page design exactly, with only the first tab content and sidebar bottom image differing.

## Solution: Unified `SingleProductTabSection`

Replace all three tab section components with one parameterized component.

### Architecture

```
SingleProductTabSection
├── StickyTabBar (shared — button-based tabs with bottom border indicator)
├── TwoColumnLayout
│   ├── LeftColumn (58%)
│   │   ├── Tab 1: varies by productType
│   │   │   ├── activity → OverViewPanel (description + highlights)
│   │   │   ├── itinerary → ItineraryPanel (date-driven day-by-day schedule)
│   │   │   └── package → ItineraryPanel (same component, "Package" label)
│   │   ├── WhatIncludedPanel (shared)
│   │   ├── ReviewPanel (shared, conditional on hasReviews)
│   │   ├── FaqPanel (shared)
│   │   └── SimilarExperiences (shared)
│   └── RightColumn (42%)
│       └── ProductSidebar (shared)
│           ├── "From $X" price heading
│           ├── SingleProductForm (shared date/travelers picker)
│           ├── Addon selection (checkbox list)
│           ├── Action card (total + Select / Show Cart)
│           ├── Questions card (help center + product ID)
│           └── Decorative bottom image (parameterized)
```

### Props API

```ts
type ProductType = 'activity' | 'itinerary' | 'package';

interface SingleProductTabSectionProps {
  productType: ProductType;
  productId: string | number;
  productData: any;
  similarActivities?: any[];
  activitySlug?: string;
  sidebarBottomImage?: string; // defaults per productType
}
```

### Tab Configuration (derived from productType)

| productType | Tab 1 Label | Tab 1 Component | Tab 2 | Tab 3 | Tab 4 |
|---|---|---|---|---|---|
| activity | Overview | OverViewPanel | What's Included | Reviews* | FAQs |
| itinerary | Itinerary | ItineraryPanel | What's Included | Reviews* | FAQs |
| package | Package | ItineraryPanel | What's Included | Reviews* | FAQs |

*Reviews tab conditionally hidden when `review_summary.total_reviews === 0`

### Shared Behavior (all 3 pages)

- Sticky tab bar at `top: 66px` (accounts for site header)
- Intersection Observer (threshold 0.3) for auto-activating tabs on scroll
- Smooth scroll-to-section on tab click
- 58% / 42% responsive column split (`xl:flex-row`)
- Sidebar gradient: `linear-gradient(180deg, #f5f9fa 0%, rgba(255,255,255,0.4) 100%)`
- Sidebar sticky at `top: 76px`
- Shadow on tab bar: `0 4px 8px rgba(0,0,0,0.1)`

---

## Unified Sidebar & Form

### Current State

Three separate sidebar/form components with heavy duplication:
- `ProductForm` (activity) — modern design
- `ProductFormItinerary` — old design with scuba diving package selection
- `ProductFormPackage` — old design, same as itinerary

### Design

All three pages use the activity sidebar design. A shared `ProductSidebar` component replaces all three.

**`ProductSidebar` contains:**
1. Price heading — "From $X" (normalized across data shapes)
2. `SingleProductForm` — reused for all 3 page types (date range + travelers picker)
3. Addon selection — checkbox list with original/sale pricing
4. Action card — total price + "Select" button, or "Show Cart" if already in cart
5. Questions card — help center link + product ID

**Price normalization** at the page level before passing to sidebar:
- Activity: `productData.pricing.regular_price`
- Itinerary/Package: `productData.base_pricing.variations[0].regular_price`

**Sidebar bottom images:**
- Activity: `/assets/images/activity-sidebar-bottom.png` (existing green abstract)
- Itinerary: `/assets/images/itinerary-sidebar-bottom.png` (travelers photo from pen design `image-import-13.png`)
- Package: `/assets/images/itinerary-sidebar-bottom.png` (same as itinerary)

**Date pre-selection for itinerary/package:**
- Default start date: tomorrow
- Default end date: tomorrow + (number of schedule days - 1)
- Passed as `defaultDateRange` prop to `SingleProductForm`

### Files Deleted
- `SingleProductFormItinerary.jsx`
- `SingleProductFormPackage.jsx`
- `ProductFormItinerary` export from `TabSection__modules.jsx`
- `ProductFormPackage` export from `TabSection__modules.jsx`

---

## Itinerary Panel with Date-Driven Schedule

### Design

The `ItineraryPanel` renders a day-by-day schedule with date navigation driven by the selected start date.

**Date navigation buttons** (horizontal row above schedule):
- Each button: formatted date like "3rd Oct, Mon"
- Day 1 = selected start date, Day 2 = start date + 1, etc.
- Clicking scrolls to that day's section
- Active day is visually highlighted

**Day content** (for each schedule day):
- Day heading: "Day - 1 Arrival in Port Blair"
- Transfer cards: image, name, vehicle type, features (seating/AC/first aid), pickup→dropoff locations with time
- Activity cards: image, name, location, tags, duration, type
- No "Change" or "Delete" buttons (deferred)

**Date reactivity:**
- `selectedStartDate` state lives in `SingleProductTabSection`
- Passed down to both `ItineraryPanel` (for date labels) and `SingleProductForm` (for pre-selection)
- When user changes date in sidebar, left panel dates update

---

## File Structure

### New Files
- `SingleProductTabSection.jsx` — unified tab section component
- `ProductSidebar.jsx` — extracted shared sidebar
- `ItineraryPanel.jsx` — extracted + enhanced with date navigation
- `itinerary-sidebar-bottom.png` — copied from pen design

### Modified Files
- `SingleProductForm.jsx` — add `defaultDateRange` + `onDateChange` props
- `TabSection__modules.jsx` — remove sidebar/itinerary exports, keep panel components
- `activity/[slug]/page.js` — use `SingleProductTabSection`
- `itinerary/[itinerary]/page.js` — use `SingleProductTabSection`
- `package/[package]/page.js` — use `SingleProductTabSection`
- `cities/[city]/itineraries/[itinerary]/page.js` — use `SingleProductTabSection`

### Deleted Files
- `SingleProductFormItinerary.jsx`
- `SingleProductFormPackage.jsx`

### Kept As-Is in `TabSection__modules.jsx`
- `OverViewPanel`
- `WhatIncludedPanel`
- `ReviewPanel`
- `FaqPanel` + `FaqAccordionItem`

### Page-Level Usage

All three pages become nearly identical:

```jsx
// activity/[slug]/page.js
<BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={...} />
<SingleProductTabSection
  productType="activity"
  productId={id}
  productData={activityData}
  similarActivities={similarActivities}
  activitySlug={slug}
/>

// itinerary/[itinerary]/page.js
<BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={...} />
<SingleProductTabSection
  productType="itinerary"
  productId={id}
  productData={data}
/>

// package/[package]/page.js
<BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={...} />
<SingleProductTabSection
  productType="package"
  productId={id}
  productData={data}
/>
```

---

## Success Criteria

1. All three single product pages render with the same modern design (matching activity page)
2. Itinerary and package pages show day-by-day schedule with date navigation
3. Date pre-selection works (tomorrow by default, updates when user selects)
4. Sidebar is identical across pages except bottom decorative image
5. Old form components are removed with no regressions
6. Reviews section conditionally hidden when no reviews exist
7. Similar Experiences section shows on all three pages
