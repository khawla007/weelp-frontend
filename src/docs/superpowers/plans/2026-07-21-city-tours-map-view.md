# City Tours Map View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the city tours `View on Map` placeholder into a same-page map/list toggle for the currently visible tours.

**Architecture:** `SharedToursSection` continues to own API fetching and controls. A new coordinate helper normalizes marker data from itinerary and city coordinates. A new `ToursMapView` client component renders MapLibre and a compact card list from pre-mapped card data plus normalized marker data.

**Tech Stack:** Next.js 16 App Router, React 19 client components, MapLibre GL, Jest, Testing Library.

---

### Task 1: Section Toggle Tests

**Files:**

- Modify: `frontend/src/app/components/Pages/FRONT_END/shared/__tests__/SharedToursSection.test.jsx`

- [ ] Extend the existing tests and add a mock for `ToursMapView`.
- [ ] Assert that fetched `Dubai Tours` cards render in list mode.
- [ ] Click `View on Map` and assert that the mocked map view appears with the tour count.
- [ ] Click `View as List` and assert that list cards are visible again.
- [ ] Run `npm test -- SharedToursSection.test.jsx --runInBand` and confirm the new tests fail because map mode does not exist yet.

### Task 2: Coordinate Helper Tests

**Files:**

- Create: `frontend/src/app/components/Pages/FRONT_END/shared/__tests__/tourMapMarkers.test.js`
- Create: `frontend/src/app/components/Pages/FRONT_END/shared/tourMapMarkers.js`

- [ ] Write failing tests for item coordinate precedence, location coordinate fallback, city coordinate fallback, Dubai slug fallback, invalid coordinate rejection, and per-item fallback offsets.
- [ ] Implement `buildTourMapMarkers(items, cards, { citySlug, cityCoordinates })`.
- [ ] Run `npm test -- tourMapMarkers.test.js --runInBand` and confirm the helper tests pass.

### Task 3: Map View Component

**Files:**

- Create: `frontend/src/app/components/Pages/FRONT_END/shared/ToursMapView.jsx`
- Create: `frontend/src/app/components/Pages/FRONT_END/shared/__tests__/ToursMapView.test.jsx`
- Modify: none

- [ ] Write a failing test that mocks `maplibre-gl` to throw on initialization and confirms the fallback message plus compact tour title still render.
- [ ] Build a client component that accepts `cards`, `markers`, and `cityName`.
- [ ] Initialize MapLibre only in the browser and recover with a visible fallback if WebGL or MapLibre fails.
- [ ] Render markers with popups containing title, price, rating, and a plain-anchor `View details` link because MapLibre popups render outside React.
- [ ] Remove old markers before marker updates and on unmount so pagination, tag, and sort changes cannot duplicate pins.
- [ ] Render a compact synchronized list beside or below the map.

### Task 4: Wire Toggle Into SharedToursSection

**Files:**

- Modify: `frontend/src/app/(frontend)/cities/[city]/page.js`
- Modify: `frontend/src/app/components/Pages/FRONT_END/shared/SharedToursSection.jsx`

- [ ] Pass `cityCoordinates={{ latitude: citydata?.location_details?.latitude, longitude: citydata?.location_details?.longitude }}` from the city page into `SharedToursSection`.
- [ ] Add `isMapView` state.
- [ ] Use `buildTourMapMarkers()` to normalize city and marker coordinates from each itinerary.
- [ ] Change the button label between `View on Map` and `View as List`.
- [ ] Render `ToursMapView` instead of the grid while map mode is active and cards exist.
- [ ] Keep loading, error, empty, sort, tag filters, and pagination behavior unchanged.

### Task 5: Verification

**Files:**

- Modify: none

- [ ] Run the focused section test.
- [ ] Run the coordinate helper test.
- [ ] Run the map-view failure test.
- [ ] Run `npm run type-check`.
- [ ] Run `npm run lint`.
- [ ] Open `http://localhost:3000/cities/dubai` in a visible headed browser.
- [ ] Click `View on Map`, verify the map/list view appears, then click `View as List`.
- [ ] Verify the same page at a mobile viewport or narrow headed browser size.
