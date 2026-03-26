# Addons for Itinerary & Package Pages

**Date:** 2026-03-26
**Status:** Draft
**Scope:** Enable addons selection on single itinerary and package pages (matching activity page functionality)

---

## Problem

The single activity page displays addon options in the sidebar (WiFi, Photography Package, etc.) that users can select before booking. The single itinerary and package pages currently do NOT have this feature:

| Page | Has Addons API? | Shows Addon Selection? |
|------|-----------------|------------------------|
| Activity | ✅ Yes (included in response) | ✅ Yes |
| Itinerary | ❌ No | ❌ No |
| Package | ❌ No | ❌ No |

Users should be able to select addons when booking itineraries and packages, just like they can for activities.

---

## Solution: Unified Addons Fetching

### Architecture

```
ProductSidebar (shared component)
├── Fetch addons via SWR
│   ├── For activity: use productData.addons (already in response)
│   ├── For itinerary: fetch from /api/itineraries/{slug}/addons
│   └── For package: fetch from /api/packages/{slug}/addons
├── Render addon checkboxes
└── Calculate total with addons
```

### Frontend Changes

**1. Service Functions** (`frontend/src/lib/services/reviews.js` or new `addons.js`)

```javascript
// Fetch addons for itinerary
export async function getItineraryAddons(itinerarySlug) {
  const response = await publicApi.get(`/api/itineraries/${itinerarySlug}/addons`);
  return response?.data;
}

// Fetch addons for package
export async function getPackageAddons(packageSlug) {
  const response = await publicApi.get(`/api/packages/${packageSlug}/addons`);
  return response?.data;
}
```

**2. Update ProductSidebar** (`ProductSidebar.jsx`)

- Add SWR fetch for itinerary/package addons
- Pass `productType` and slug to determine fetch strategy
- Merge fetched addons with component state

```javascript
import useSWR from 'swr';
import { getItineraryAddons, getPackageAddons } from '@/lib/services/addons';

const ProductSidebar = ({ productId, productData, productType, activitySlug, itinerarySlug, packageSlug, scheduleCount, defaultDateRange, onDateChange }) => {
  // For activity: use productData.addons (already in response)
  // For itinerary/package: fetch via SWR
  const addonSlug = activitySlug || itinerarySlug || packageSlug;
  const fetchFn = productType === 'itinerary' ? getItineraryAddons
                 : productType === 'package' ? getPackageAddons
                 : null;

  const { data: fetchedAddons } = useSWR(
    (productType === 'itinerary' || productType === 'package') && addonSlug ? `${productType}/${addonSlug}/addons` : null,
    () => fetchFn(addonSlug),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  // Use addons from API response or fetched data
  const addons = productData?.addons || fetchedAddons?.data || [];
  // ... rest of component
};
```

**3. Update Page Components** - pass slugs to ProductSidebar

- `activity/[slug]/page.js` → pass `activitySlug={slug}`
- `itinerary/[itinerary]/page.js` → pass `productType="itinerary"`, `itinerarySlug={itinerary}`
- `package/[package]/page.js` → pass `productType="package"`, `packageSlug={package}`
- `SingleProductTabSection.jsx` → forward these props to ProductSidebar

### Backend Changes (Laravel)

**1. Add Route** (`routes/api.php`)

```php
// Itinerary addons
Route::get('/itineraries/{slug}/addons', [ItineraryController::class, 'getAddons']);

// Package addons
Route::get('/packages/{slug}/addons', [PackageController::class, 'getAddons']);
```

**2. Controller Methods** (`ItineraryController.php`, `PackageController.php`)

```php
public function getAddons($slug)
{
    $itinerary = Itinerary::where('slug', $slug)->firstOrFail();

    // For now, return global addons (or attach to product later)
    $addons = Addon::where('is_active', true)
        ->where(function($q) use ($itinerary) {
            $q->where('addon_type', 'itinerary')
              ->orWhereNull('addon_type');
        })
        ->get()
        ->map(function ($addon) {
            return [
                'addon_id' => $addon->id,
                'addon_name' => $addon->name,
                'addon_description' => $addon->description,
                'addon_price' => $addon->price,
                'addon_sale_price' => $addon->sale_price,
                'addon_type' => $addon->addon_type,
            ];
        });

    return response()->json([
        'success' => true,
        'data' => $addons
    ]);
}
```

**3. Database Schema** (if addon-product relationship doesn't exist)

```php
// Future: Add pivot table for product-specific addons
Schema::create('addon_itinerary', function (Blueprint $table) {
    $table->id();
    $table->foreignId('addon_id')->constrained()->onDelete('cascade');
    $table->foreignId('itinerary_id')->constrained()->onDelete('cascade');
    $table->timestamps();
});

// Same for packages
Schema::create('addon_package', function (Blueprint $table) {
    $table->id();
    $table->foreignId('addon_id')->constrained()->onDelete('cascade');
    $table->foreignId('package_id')->constrained()->onDelete('cascade');
    $table->timestamps();
});
```

---

## Files to Modify

### Frontend
- `src/lib/services/addons.js` — create (or add to `reviews.js`)
- `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx` — SWR fetch logic
- `src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx` — pass productType, slugs
- `src/app/(frontend)/activity/[slug]/page.js` — pass activitySlug
- `src/app/(frontend)/itinerary/[itinerary]/page.js` — pass productType, itinerarySlug
- `src/app/(frontend)/package/[package]/page.js` — pass productType, packageSlug

### Backend
- `routes/api.php` — add addon endpoints
- `app/Http/Controllers/ItineraryController.php` — add getAddons()
- `app/Http/Controllers/PackageController.php` — add getAddons()

---

## Success Criteria

1. Itinerary page shows addon checkboxes in sidebar (WiFi, Photography, etc.)
2. Package page shows addon checkboxes in sidebar
3. Addon selection updates total price correctly
4. Addons are included in cart submission
5. SWR caching prevents duplicate API calls
6. Fallback to empty array if API fails (no broken UI)

---

## Open Questions

1. Should addons be global (same for all products) or product-specific?
   - **Recommendation:** Start with global addons, add product-specific later via pivot tables

2. Should pricing differ by product type?
   - **Recommendation:** Yes, add `price` to pivot table for product-specific pricing

3. Should we show addons for activities via SWR too (for consistency)?
   - **Recommendation:** No, keep activity response as-is (already includes addons)

---

## Future Enhancements

- Product-specific addon pricing in pivot table
- Admin panel to assign addons to itinerary/package
- Addon availability based on dates/seasons
- Addon categories (equipment, services, experiences)
