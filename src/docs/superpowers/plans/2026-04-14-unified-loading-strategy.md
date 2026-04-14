# Unified Loading Strategy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all scattered loading states (bouncing dots, spinners, full-screen overlays) with a unified progress bar for navigation and skeleton loaders for content across frontend and dashboard.

**Architecture:**

- Progress bar (NProgress) handles all route navigation via `useNavigationEvents` hook
- Existing skeleton loaders replace inline spinners in content areas
- Dashboard layout adopts the same progress bar system as frontend
- Unused loader components (PageLoader, NavigationLoader, AdminLoading) are removed

**Tech Stack:**

- NProgress (already installed)
- React hooks (useEffect, useRef)
- Zustand (useNavigationStore)
- Next.js App Router

---

## File Structure

| File                                                                      | Action | Responsibility                |
| ------------------------------------------------------------------------- | ------ | ----------------------------- |
| `src/app/(dashboard)/dashboard/layout.js`                                 | Modify | Add progress bar to dashboard |
| `src/app/components/Pages/FRONT_END/region/region_filter.jsx`             | Modify | Replace spinner with skeleton |
| `src/app/components/Pages/FRONT_END/region/region_filter_rhf.jsx`         | Modify | Replace spinner with skeleton |
| `src/app/components/Pages/FRONT_END/city/CityFilterSection.jsx`           | Modify | Replace spinner with skeleton |
| `src/app/components/Pages/FRONT_END/city/CityToursSection.jsx`            | Modify | Replace spinner with skeleton |
| `src/app/(dashboard)/dashboard/admin/destinations/countries/[id]/page.js` | Modify | Remove PageLoader import      |
| `src/app/(dashboard)/dashboard/admin/destinations/states/[id]/page.js`    | Modify | Remove PageLoader import      |
| `src/app/(dashboard)/dashboard/admin/destinations/cities/[id]/page.js`    | Modify | Remove PageLoader import      |
| `src/app/(dashboard)/dashboard/admin/destinations/places/[id]/page.js`    | Modify | Remove PageLoader import      |
| `src/app/components/Loading/PageLoader.jsx`                               | Delete | Remove unused component       |
| `src/app/components/Navigation/NavigationLoader.jsx`                      | Delete | Remove unused component       |
| `src/app/(dashboard)/dashboard/admin/loading.js`                          | Delete | Remove unused component       |

---

## Task 1: Add Progress Bar to Dashboard Layout

**Files:**

- Modify: `src/app/(dashboard)/dashboard/layout.js`

- [ ] **Step 1: Read current dashboard layout**

```bash
cat src/app/(dashboard)/dashboard/layout.js
```

Expected: Current layout with ThemeWrapper and AppProviders only.

- [ ] **Step 2: Make layout a client component and add navigation handlers**

```javascript
'use client';

import { ThemeWrapper } from './theme-wrapper';
import AppProviders from '@/app/components/Layout/ProviderWrapper';
import { useNavigationEvents } from '@/hooks/useNavigationEvents';
import { NavigationProgressBar } from '@/app/components/Navigation/NavigationProgressBar';

function DashboardNavigationHandler() {
  useNavigationEvents();
  return null;
}

export default function DashboardLayout({ children }) {
  return (
    <ThemeWrapper>
      <AppProviders>
        <DashboardNavigationHandler />
        <NavigationProgressBar />
        {children}
      </AppProviders>
    </ThemeWrapper>
  );
}
```

- [ ] **Step 3: Lint check**

```bash
cd frontend && npm run lint
```

Expected: No linting errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/dashboard/layout.js
git commit -m "feat: add progress bar to dashboard layout"
```

---

## Task 2: Replace Spinner with Skeleton in region_filter.jsx

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/region/region_filter.jsx`

- [ ] **Step 1: Read the file to find LoadingPage usage**

```bash
grep -n "LoadingPage" src/app/components/Pages/FRONT_END/region/region_filter.jsx
```

Expected: Line ~189 with `{isLoading && <LoadingPage />}`

- [ ] **Step 2: Import skeleton component**

Add at top with other imports:

```javascript
import { ProductCardSkelton } from '@/app/components/Animation/Cards';
```

- [ ] **Step 3: Replace LoadingPage with skeleton**

Find and replace:

```javascript
// Before
{
  isLoading && <LoadingPage />;
}

// After
{
  isLoading && (
    <div className="flex gap-4 flex-wrap justify-center">
      {[...Array(6)].map((_, i) => (
        <ProductCardSkelton key={i} className="sm:max-w-xs w-full" />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Remove unused LoadingPage import**

```bash
# Remove this line from imports:
import { LoadingPage } from '@/app/components/Animation/Cards';
```

- [ ] **Step 5: Lint check**

```bash
npm run lint
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/Pages/FRONT_END/region/region_filter.jsx
git commit -m "refactor: replace spinner with skeleton in region_filter"
```

---

## Task 3: Replace Spinner with Skeleton in region_filter_rhf.jsx

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/region/region_filter_rhf.jsx`

- [ ] **Step 1: Read the file to find LoadingPage usage**

```bash
grep -n "LoadingPage" src/app/components/Pages/FRONT_END/region/region_filter_rhf.jsx
```

Expected: Line ~189 with loading state.

- [ ] **Step 2: Import skeleton component**

Add at top:

```javascript
import { ProductCardSkelton } from '@/app/components/Animation/Cards';
```

- [ ] **Step 3: Replace LoadingPage with skeleton**

```javascript
// Before
{
  isLoading && <LoadingPage />;
}

// After
{
  isLoading && (
    <div className="flex gap-4 flex-wrap justify-center">
      {[...Array(6)].map((_, i) => (
        <ProductCardSkelton key={i} className="sm:max-w-xs w-full" />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Remove unused LoadingPage import**

- [ ] **Step 5: Lint check**

```bash
npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add src/app/components/Pages/FRONT_END/region/region_filter_rhf.jsx
git commit -m "refactor: replace spinner with skeleton in region_filter_rhf"
```

---

## Task 4: Replace Spinner with Skeleton in CityFilterSection

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/city/CityFilterSection.jsx`

- [ ] **Step 1: Find LoadingPage usage**

```bash
grep -n "LoadingPage" src/app/components/Pages/FRONT_END/city/CityFilterSection.jsx
```

Expected: Line ~86.

- [ ] **Step 2: Import skeleton component**

```javascript
import { ProductCardSkelton } from '@/app/components/Animation/Cards';
```

- [ ] **Step 3: Replace LoadingPage with skeleton**

```javascript
// Before
{
  isLoading && <LoadingPage />;
}

// After
{
  isLoading && (
    <div className="flex gap-4 flex-wrap justify-center">
      {[...Array(6)].map((_, i) => (
        <ProductCardSkelton key={i} className="sm:max-w-xs w-full" />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Remove unused LoadingPage import**

- [ ] **Step 5: Lint check**

```bash
npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add src/app/components/Pages/FRONT_END/city/CityFilterSection.jsx
git commit -m "refactor: replace spinner with skeleton in CityFilterSection"
```

---

## Task 5: Replace Spinner with Skeleton in CityToursSection

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/city/CityToursSection.jsx`

- [ ] **Step 1: Find LoadingPage usage**

```bash
grep -n "LoadingPage" src/app/components/Pages/FRONT_END/city/CityToursSection.jsx
```

Expected: Line ~219.

- [ ] **Step 2: Import skeleton component**

```javascript
import { ProductCardSkelton } from '@/app/components/Animation/Cards';
```

- [ ] **Step 3: Replace LoadingPage with skeleton**

```javascript
// Before
{
  isLoading && <LoadingPage />;
}

// After
{
  isLoading && (
    <div className="flex gap-4 flex-wrap justify-center">
      {[...Array(6)].map((_, i) => (
        <ProductCardSkelton key={i} className="sm:max-w-xs w-full" />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Remove unused LoadingPage import**

- [ ] **Step 5: Lint check**

```bash
npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add src/app/components/Pages/FRONT_END/city/CityToursSection.jsx
git commit -m "refactor: replace spinner with skeleton in CityToursSection"
```

---

## Task 6: Remove PageLoader from countries/[id]/page.js

**Files:**

- Modify: `src/app/(dashboard)/dashboard/admin/destinations/countries/[id]/page.js`

- [ ] **Step 1: Read the file**

```bash
cat src/app/(dashboard)/dashboard/admin/destinations/countries/[id]/page.js
```

Expected: Has PageLoader import and usage.

- [ ] **Step 2: Remove PageLoader import**

Remove this line:

```javascript
import { PageLoader } from '@/app/components/Loading/PageLoader';
```

- [ ] **Step 3: Replace PageLoader return with simple loading div**

```javascript
// Before
return <PageLoader />;

// After
return (
  <div className="flex items-center justify-center min-h-[60vh]">
    <p>Loading country data...</p>
  </div>
);
```

Or simply let the progress bar handle it:

```javascript
return null;
```

- [ ] **Step 4: Lint check**

```bash
npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/dashboard/admin/destinations/countries/[id]/page.js
git commit -m "refactor: remove PageLoader from countries page"
```

---

## Task 7: Remove PageLoader from states/[id]/page.js

**Files:**

- Modify: `src/app/(dashboard)/dashboard/admin/destinations/states/[id]/page.js`

- [ ] **Step 1: Remove PageLoader import**

Remove:

```javascript
import { PageLoader } from '@/app/components/Loading/PageLoader';
```

- [ ] **Step 2: Replace PageLoader return**

```javascript
// Before
return <PageLoader />;

// After
return (
  <div className="flex items-center justify-center min-h-[60vh]">
    <p>Loading state data...</p>
  </div>
);
```

- [ ] **Step 3: Lint check**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/dashboard/admin/destinations/states/[id]/page.js
git commit -m "refactor: remove PageLoader from states page"
```

---

## Task 8: Remove PageLoader from cities/[id]/page.js

**Files:**

- Modify: `src/app/(dashboard)/dashboard/admin/destinations/cities/[id]/page.js`

- [ ] **Step 1: Remove PageLoader import**

Remove:

```javascript
import { PageLoader } from '@/app/components/Loading/PageLoader';
```

- [ ] **Step 2: Replace PageLoader return**

```javascript
// Before
return <PageLoader />;

// After
return (
  <div className="flex items-center justify-center min-h-[60vh]">
    <p>Loading city data...</p>
  </div>
);
```

- [ ] **Step 3: Lint check**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/dashboard/admin/destinations/cities/[id]/page.js
git commit -m "refactor: remove PageLoader from cities page"
```

---

## Task 9: Remove PageLoader from places/[id]/page.js

**Files:**

- Modify: `src/app/(dashboard)/dashboard/admin/destinations/places/[id]/page.js`

- [ ] **Step 1: Remove PageLoader import**

Remove:

```javascript
import { PageLoader } from '@/app/components/Loading/PageLoader';
```

- [ ] **Step 2: Replace PageLoader return**

```javascript
// Before
return <PageLoader />;

// After
return (
  <div className="flex items-center justify-center min-h-[60vh]">
    <p>Loading place data...</p>
  </div>
);
```

- [ ] **Step 3: Lint check**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/dashboard/admin/destinations/places/[id]/page.js
git commit -m "refactor: remove PageLoader from places page"
```

---

## Task 10: Delete Unused Loader Components

**Files:**

- Delete: `src/app/components/Loading/PageLoader.jsx`
- Delete: `src/app/components/Navigation/NavigationLoader.jsx`
- Delete: `src/app/(dashboard)/dashboard/admin/loading.js`

- [ ] **Step 1: Check for any remaining imports of deleted components**

```bash
grep -r "PageLoader" src/app --include="*.jsx" --include="*.js" | grep -v "node_modules"
```

Expected: No results (already removed in previous tasks).

- [ ] **Step 2: Check for NavigationLoader imports**

```bash
grep -r "NavigationLoader" src/app --include="*.jsx" --include="*.js" | grep -v "node_modules"
```

Expected: No results.

- [ ] **Step 3: Delete PageLoader component**

```bash
rm src/app/components/Loading/PageLoader.jsx
```

- [ ] **Step 4: Delete NavigationLoader component**

```bash
rm src/app/components/Navigation/NavigationLoader.jsx
```

- [ ] **Step 5: Delete AdminLoading component**

```bash
rm src/app/(dashboard)/dashboard/admin/loading.js
```

- [ ] **Step 6: Lint check**

```bash
npm run lint
```

Expected: No errors (components were unused).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: remove unused loader components"
```

---

## Task 11: Final Verification

**Files:**

- No modifications (verification only)

- [ ] **Step 1: Verify no more LoadingPage imports**

```bash
grep -r "LoadingPage" src/app --include="*.jsx" --include="*.js" | grep -v "node_modules" | grep -v "ProductCardSkelton\|DestinationCardSkelton\|TestimonialCardSkelton\|ReviewCardSkelton\|DashboardCardSkelton\|ImageSkeltonCard"
```

Expected: No results (only skeleton components should remain).

- [ ] **Step 2: Verify no more PageLoader imports**

```bash
grep -r "PageLoader" src/app --include="*.jsx" --include="*.js" | grep -v "node_modules"
```

Expected: No results.

- [ ] **Step 3: Verify no more NavigationLoader imports**

```bash
grep -r "NavigationLoader" src/app --include="*.jsx" --include="*.js" | grep -v "node_modules"
```

Expected: No results.

- [ ] **Step 4: Verify NavigationProgressBar is in both layouts**

```bash
grep -n "NavigationProgressBar" src/app/(frontend)/FrontendShell.jsx src/app/(dashboard)/dashboard/layout.js
```

Expected: Both files contain the import and usage.

- [ ] **Step 5: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds without errors.

- [ ] **Step 6: Final commit**

```bash
git commit --allow-empty -m "chore: unified loading strategy implementation complete"
```

---

## Testing Checklist

After implementation, manually verify:

- [ ] Click navigation links on frontend → green progress bar appears at top
- [ ] Navigate between dashboard pages → green progress bar appears at top
- [ ] Change city filters → skeleton loaders appear in content area
- [ ] No full-screen bouncing dot loaders appear anywhere
- [ ] No CSS spinner loaders appear in filter sections
- [ ] All routes load successfully with progress indication

---

## Summary

**Total Tasks:** 11
**Total Files Modified:** 9
**Total Files Deleted:** 3
**Estimated Time:** 45-60 minutes
