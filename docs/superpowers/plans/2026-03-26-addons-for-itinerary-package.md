# Addons for Itinerary & Package Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable addons selection on single itinerary and package pages, matching activity page functionality.

**Architecture:** SWR-based fetching pattern similar to reviews - ProductSidebar fetches addons via dedicated API endpoints when productType is itinerary/package. Activity addons remain embedded in the activity response.

**Tech Stack:** Next.js 15, React 19, SWR, Laravel 11, MySQL

---

## File Structure

### Backend Files
- `backend/routes/api.php` — Add public addon endpoints
- `backend/app/Http/Controllers/Guest/PublicItineraryController.php` — Add `getAddons()` method
- `backend/app/Http/Controllers/Guest/PublicPackageController.php` — Add `getAddons()` method

### Frontend Files
- `frontend/src/lib/services/addOn.js` — Add public addon fetch functions
- `frontend/src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx` — Add SWR fetch for itinerary/package addons
- `frontend/src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx` — Pass productType and slugs to ProductSidebar
- `frontend/src/app/(frontend)/itinerary/[itinerary]/page.js` — Pass itinerarySlug to SingleProductTabSection
- `frontend/src/app/(frontend)/package/[package]/page.js` — Pass packageSlug to SingleProductTabSection

---

## Task 1: Backend — Add Itinerary Addons Endpoint

**Files:**
- Modify: `backend/app/Http/Controllers/Guest/PublicItineraryController.php`

- [ ] **Step 1: Add getAddons method to PublicItineraryController**

Add the following method to `PublicItineraryController.php` after the `show()` method:

```php
/**
 * Get addons for a specific itinerary
 * Used on: Single Itinerary Page - sidebar addon selection
 */
public function getAddons($slug): JsonResponse
{
    $itinerary = Itinerary::where('slug', $slug)->first();

    if (!$itinerary) {
        return response()->json([
            'success' => false,
            'message' => 'Itinerary not found'
        ], 404);
    }

    // Get addons linked to this itinerary via itinerary_addons pivot table
    $addons = \App\Models\Addon::where('active_status', true)
        ->whereHas('itinerariesAddon', function ($query) use ($itinerary) {
            $query->where('itinerary_id', $itinerary->id);
        })
        ->get()
        ->map(function ($addon) {
            return [
                'addon_id' => $addon->id,
                'addon_name' => $addon->name,
                'addon_description' => $addon->description,
                'addon_price' => $addon->price,
                'addon_sale_price' => $addon->sale_price,
                'addon_type' => $addon->type,
            ];
        });

    return response()->json([
        'success' => true,
        'data' => $addons
    ]);
}
```

- [ ] **Step 2: Verify the method compiles**

Run: `cd backend && php artisan route:list | grep itinerary`
Expected: Should not error

---

## Task 2: Backend — Add Package Addons Endpoint

**Files:**
- Modify: `backend/app/Http/Controllers/Guest/PublicPackageController.php`

- [ ] **Step 1: Add getAddons method to PublicPackageController**

Add the following method to `PublicPackageController.php` after the `show()` method:

```php
/**
 * Get addons for a specific package
 * Used on: Single Package Page - sidebar addon selection
 */
public function getAddons($slug): JsonResponse
{
    $package = Package::where('slug', $slug)->first();

    if (!$package) {
        return response()->json([
            'success' => false,
            'message' => 'Package not found'
        ], 404);
    }

    // Get addons linked to this package via package_addons pivot table
    $addons = \App\Models\Addon::where('active_status', true)
        ->whereHas('packagesAddon', function ($query) use ($package) {
            $query->where('package_id', $package->id);
        })
        ->get()
        ->map(function ($addon) {
            return [
                'addon_id' => $addon->id,
                'addon_name' => $addon->name,
                'addon_description' => $addon->description,
                'addon_price' => $addon->price,
                'addon_sale_price' => $addon->sale_price,
                'addon_type' => $addon->type,
            ];
        });

    return response()->json([
        'success' => true,
        'data' => $addons
    ]);
}
```

- [ ] **Step 2: Verify the method compiles**

Run: `cd backend && php artisan route:list | grep package`
Expected: Should not error

---

## Task 3: Backend — Add API Routes

**Files:**
- Modify: `backend/routes/api.php`

- [ ] **Step 1: Add addon routes to the public itineraries group**

Locate the `itineraries` route group (around line 408-412) and add the addons route:

```php
// itineraries api
Route::prefix('itineraries')->group(function () {
    Route::get('/', [PublicItineraryController::class, 'index']);
    Route::get('/featured-itineraries', [PublicItineraryController::class, 'getFeaturedItineraries']);
    Route::get('/{slug}', [PublicItineraryController::class, 'show']);
    Route::get('/{slug}/addons', [PublicItineraryController::class, 'getAddons']);
});
```

- [ ] **Step 2: Add addon route to the public packages group**

Locate the `packages` route group (around line 415-419) and add the addons route:

```php
// Packages api
Route::prefix('packages')->group(function () {
    Route::get('/', [PublicPackageController::class, 'index']);
    Route::get('/featured-packages', [PublicPackageController::class, 'getFeaturedPackages']);
    Route::get('/{slug}', [PublicPackageController::class, 'show']);
    Route::get('/{slug}/addons', [PublicPackageController::class, 'getAddons']);
});
```

- [ ] **Step 3: Verify routes are registered**

Run: `cd backend && php artisan route:list --path=addons`
Expected: Should show both new routes:
- GET /api/itineraries/{slug}/addons
- GET /api/packages/{slug}/addons

---

## Task 4: Frontend — Add Public Addon Service Functions

**Files:**
- Modify: `frontend/src/lib/services/addOn.js`

- [ ] **Step 1: Add import for publicApi**

At the top of the file, ensure `publicApi` is imported (it should already be there from `authApi` import):

```javascript
import { ApiError } from '@/dto/Error';
import { authApi, publicApi } from '../axiosInstance';
import { log } from '../utils';
```

- [ ] **Step 2: Add public addon fetch functions**

Add the following functions at the end of the file (after `getAddOnOptionsAdmin`):

```javascript

/**
 * Get addons for a specific itinerary
 * Used on: Single Itinerary Page - sidebar addon selection
 * @param {string} itinerarySlug - Itinerary slug
 * @returns {Promise<{ success: boolean, data: any[] }>}
 */
export async function getItineraryAddons(itinerarySlug) {
  try {
    const response = await publicApi.get(`/api/itineraries/${itinerarySlug}/addons`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    console.error('Error fetching itinerary addons:', error?.message || error);
    return { success: false, data: [] };
  }
}

/**
 * Get addons for a specific package
 * Used on: Single Package Page - sidebar addon selection
 * @param {string} packageSlug - Package slug
 * @returns {Promise<{ success: boolean, data: any[] }>}
 */
export async function getPackageAddons(packageSlug) {
  try {
    const response = await publicApi.get(`/api/packages/${packageSlug}/addons`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    console.error('Error fetching package addons:', error?.message || error);
    return { success: false, data: [] };
  }
}
```

- [ ] **Step 3: Verify no syntax errors**

Run: `cd frontend && npm run lint -- --quiet src/lib/services/addOn.js`
Expected: No errors

---

## Task 5: Frontend — Update ProductSidebar for SWR Fetching

**Files:**
- Modify: `frontend/src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx`

- [ ] **Step 1: Add imports for SWR and addon services**

Add at the top of the file after the existing imports:

```javascript
'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import useSWR from 'swr';
import SingleProductForm from '@/app/components/Form/SingleProductForm';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { getItineraryAddons, getPackageAddons } from '@/lib/services/addOn';
```

- [ ] **Step 2: Update component props signature**

Change the component function signature from:

```javascript
const ProductSidebar = ({ productId, productData, defaultDateRange = null, onDateChange = null, scheduleCount = 0 }) => {
```

To:

```javascript
const ProductSidebar = ({
  productId,
  productData,
  productType = 'activity',
  itinerarySlug,
  packageSlug,
  defaultDateRange = null,
  onDateChange = null,
  scheduleCount = 0,
}) => {
```

- [ ] **Step 3: Add SWR fetch logic after the state declarations**

Add after `const isInCart = cartItems.some(...)` line (around line 11):

```javascript
  // Fetch addons via SWR for itinerary/package (activity addons come from productData)
  const addonSlug = productType === 'itinerary' ? itinerarySlug : productType === 'package' ? packageSlug : null;
  const addonFetcher = productType === 'itinerary' ? getItineraryAddons : productType === 'package' ? getPackageAddons : null;

  const { data: addonsResponse } = useSWR(
    addonSlug ? `${productType}/${addonSlug}/addons` : null,
    () => addonFetcher(addonSlug),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  // Use addons from API response (activity) or fetched data (itinerary/package)
  const addons = productType === 'activity'
    ? (productData?.addons || [])
    : (addonsResponse?.data || []);
```

- [ ] **Step 4: Update the addon rendering section to use the new `addons` variable**

Change line 41 from:

```javascript
      {productData?.addons?.length > 0 && (
```

To:

```javascript
      {addons.length > 0 && (
```

- [ ] **Step 5: Update the map to use `addons` instead of `productData.addons`**

Change line 45 from:

```javascript
            {productData.addons.map((addon) => {
```

To:

```javascript
            {addons.map((addon) => {
```

- [ ] **Step 6: Verify no syntax errors**

Run: `cd frontend && npm run lint -- --quiet src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx`
Expected: No errors

---

## Task 6: Frontend — Update SingleProductTabSection to Pass Props

**Files:**
- Modify: `frontend/src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx`

- [ ] **Step 1: Update component props signature**

Change the component function signature from (line 36):

```javascript
const SingleProductTabSection = ({ productType = 'activity', productId, productData, similarActivities = [], activitySlug, sidebarBottomImage }) => {
```

To:

```javascript
const SingleProductTabSection = ({
  productType = 'activity',
  productId,
  productData,
  similarActivities = [],
  activitySlug,
  itinerarySlug,
  packageSlug,
  sidebarBottomImage,
}) => {
```

- [ ] **Step 2: Update ProductSidebar call to pass new props**

Change line 180 from:

```javascript
          <ProductSidebar productId={productId} productData={productData} defaultDateRange={defaultDateRange} onDateChange={isScheduleType ? handleDateChange : null} scheduleCount={isScheduleType ? scheduleCount : 0} />
```

To:

```javascript
          <ProductSidebar
            productId={productId}
            productData={productData}
            productType={productType}
            itinerarySlug={itinerarySlug}
            packageSlug={packageSlug}
            defaultDateRange={defaultDateRange}
            onDateChange={isScheduleType ? handleDateChange : null}
            scheduleCount={isScheduleType ? scheduleCount : 0}
          />
```

- [ ] **Step 3: Verify no syntax errors**

Run: `cd frontend && npm run lint -- --quiet src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx`
Expected: No errors

---

## Task 7: Frontend — Update Itinerary Page to Pass Slug

**Files:**
- Modify: `frontend/src/app/(frontend)/itinerary/[itinerary]/page.js`

- [ ] **Step 1: Update SingleProductTabSection call to pass itinerarySlug**

Change line 51 from:

```javascript
      <SingleProductTabSection productType="itinerary" productId={id} productData={data} />
```

To:

```javascript
      <SingleProductTabSection productType="itinerary" productId={id} productData={data} itinerarySlug={itinerary} />
```

- [ ] **Step 2: Verify no syntax errors**

Run: `cd frontend && npm run lint -- --quiet "src/app/(frontend)/itinerary/[itinerary]/page.js"`
Expected: No errors

---

## Task 8: Frontend — Update Package Page to Pass Slug

**Files:**
- Modify: `frontend/src/app/(frontend)/package/[package]/page.js`

- [ ] **Step 1: Update SingleProductTabSection call to pass packageSlug**

Change line 36 from:

```javascript
      <SingleProductTabSection productType="package" productId={id} productData={packageData} />
```

To:

```javascript
      <SingleProductTabSection productType="package" productId={id} productData={packageData} packageSlug={pack} />
```

- [ ] **Step 2: Verify no syntax errors**

Run: `cd frontend && npm run lint -- --quiet "src/app/(frontend)/package/[package]/page.js"`
Expected: No errors

---

## Task 9: Integration Testing

**Files:**
- None (manual testing)

- [ ] **Step 1: Start the backend server**

Run: `cd backend && php artisan serve --port=8000`
Expected: Server running on port 8000

- [ ] **Step 2: Start the frontend server**

Run: `cd frontend && npm run dev`
Expected: Server running on port 3000

- [ ] **Step 3: Test itinerary addons API directly**

Run: `curl http://localhost:8000/api/itineraries/{test-slug}/addons`
Expected: JSON response with success:true and data array

- [ ] **Step 4: Test package addons API directly**

Run: `curl http://localhost:8000/api/packages/{test-slug}/addons`
Expected: JSON response with success:true and data array

- [ ] **Step 5: Test itinerary page in browser**

Navigate to: `http://localhost:3000/itinerary/{test-slug}`
Expected: Page loads without errors, addons appear in sidebar if any are linked

- [ ] **Step 6: Test package page in browser**

Navigate to: `http://localhost:3000/package/{test-slug}`
Expected: Page loads without errors, addons appear in sidebar if any are linked

- [ ] **Step 7: Verify activity page still works (regression test)**

Navigate to: `http://localhost:3000/activity/{test-slug}`
Expected: Page loads without errors, addons appear in sidebar as before

---

## Task 10: Commit Changes

**Files:**
- All modified files

- [ ] **Step 1: Stage all changes**

Run: `git add backend/routes/api.php backend/app/Http/Controllers/Guest/PublicItineraryController.php backend/app/Http/Controllers/Guest/PublicPackageController.php frontend/src/lib/services/addOn.js frontend/src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx frontend/src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx "frontend/src/app/(frontend)/itinerary/[itinerary]/page.js" "frontend/src/app/(frontend)/package/[package]/page.js"`

- [ ] **Step 2: Create commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
feat: add addons support for itinerary and package pages

- Add /api/itineraries/{slug}/addons and /api/packages/{slug}/addons endpoints
- Add getItineraryAddons and getPackageAddons service functions
- Update ProductSidebar to fetch addons via SWR for itinerary/package
- Pass productType and slugs through component chain

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

Expected: Commit created successfully

- [ ] **Step 3: Verify commit**

Run: `git log -1 --oneline`
Expected: Shows the new commit

---

## Success Criteria Checklist

- [ ] Itinerary page shows addon checkboxes in sidebar (when addons are linked)
- [ ] Package page shows addon checkboxes in sidebar (when addons are linked)
- [ ] Addon selection updates total price correctly
- [ ] SWR caching prevents duplicate API calls
- [ ] Fallback to empty array if API fails (no broken UI)
- [ ] Activity page addons still work (no regression)
- [ ] All lint checks pass
