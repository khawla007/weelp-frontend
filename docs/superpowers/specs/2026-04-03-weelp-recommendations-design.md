# Weelp Recommendations Section - Dynamic Featured Itineraries

**Date:** 2026-04-03
**Status:** Approved
**Author:** Claude

## Overview

Replace the static `FOOTER_EXPLORE_TAGS` in the Weelp Recommendations section (above footer) with dynamic featured itineraries fetched from the backend API.

## Current State

- **Location:** Homepage, above footer
- **Component:** `WeelpRecommendations.jsx`
- **Data:** Static `FOOTER_EXPLORE_TAGS` array in `shellContent.js` with 32 placeholder items
- **Links:** All point to `/` (placeholder)
- **Layout:** 8 columns × 4 rows grid

## Target State

### Data Source

- **API Endpoint:** `GET /api/itineraries/featured-itineraries`
- **Controller:** `PublicItineraryController@getFeaturedItineraries`
- **Frontend Service:** `getFeaturedItineraries()` in `lib/services/itineraries.js`

### Data Structure

```javascript
{
  name: "Things to do in Tokyo",
  slug: "things-to-do-in-tokyo",
  city_slug: "tokyo"
}
```

### Display Specifications

| Aspect | Specification |
|--------|---------------|
| Max items | 32 (random selection if database has more) |
| Layout | Grid: 8 columns (lg), 6 (md), 4 (sm), 2 (base) |
| Item display | Title only (`name`) |
| Link format | `/cities/{city_slug}/itineraries/{slug}` |
| Fallback | Hide entire section if no featured itineraries exist |

### Component Changes

**`WeelpRecommendations.jsx`**
- Convert from Client Component to async Server Component
- Fetch data using `getFeaturedItineraries()` service
- Map 32 random items to links
- Return `null` if no data

**`shellContent.js`**
- Remove `FOOTER_EXPLORE_TAGS` export (no longer needed)

## Architecture

```
page.js (homepage)
    ↓
WeelpRecommendations.jsx (async Server Component)
    ↓
getFeaturedItineraries() service
    ↓
Laravel API: /api/itineraries/featured-itineraries
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| API error / timeout | Hide section, log error |
| Empty response | Hide section |
| < 32 items | Show all available items |
| > 32 items | Randomly select 32 |

## Success Criteria

- [ ] Section displays up to 32 featured itineraries
- [ ] Each item links correctly to `/cities/{city}/itineraries/{slug}`
- [ ] Section hides when no data available
- [ ] No hydration errors
- [ ] No TypeScript/linting errors
- [ ] Layout matches current 8-column grid

## Files Modified

1. `frontend/src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx`
2. `frontend/src/app/components/Layout/shellContent.js`

## Files Unchanged (already exist)

- `frontend/src/lib/services/itineraries.js` - service already implemented
- `backend/app/Http/Controllers/Guest/PublicItineraryController.php` - endpoint already exists
- `backend/routes/api.php` - route already registered
