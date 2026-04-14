# Unified Loading Strategy Design

**Date:** 2026-04-14
**Status:** Approved
**Author:** Claude + User

---

## Overview

Unify all loading states across Weelp frontend and dashboard using a consistent, minimal loading experience. Replace scattered bouncing dots and spinner loaders with a unified progress bar for navigation and skeleton loaders for content.

---

## Goals

1. **Consistent UX** - Same loading behavior across all routes (frontend + dashboard)
2. **Minimal visual noise** - Progress bar instead of full-screen overlays
3. **Better perceived performance** - Skeletons show content structure immediately
4. **Remove technical debt** - Delete unused loader components

---

## Loading Strategy

### Navigation Routes - Progress Bar

| Aspect             | Detail                                            |
| ------------------ | ------------------------------------------------- |
| **Component**      | `NavigationProgressBar` (NProgress)               |
| **Visual**         | Green bar (#588f7a), 5px height, top of page      |
| **Behavior**       | Appears on route change, disappears on complete   |
| **Scope**          | All frontend routes + all dashboard routes        |
| **Implementation** | `useNavigationEvents` hook intercepts link clicks |

### Content Areas - Skeleton Loaders

| Aspect             | Detail                                                      |
| ------------------ | ----------------------------------------------------------- |
| **Component**      | Existing `*CardSkelton` components                          |
| **Visual**         | Gray boxes matching content structure                       |
| **Behavior**       | Shows while data fetches, replaced with actual content      |
| **Scope**          | Activity cards, destination cards, blog cards, testimonials |
| **Implementation** | Keep existing skeletons, use in more places                 |

### Forms - Button Loading States

| Aspect             | Detail                                       |
| ------------------ | -------------------------------------------- |
| **Component**      | Existing `FormActionButtons` patterns        |
| **Visual**         | Disabled button with loading indicator       |
| **Behavior**       | Button shows loading during async submission |
| **Scope**          | All form submissions                         |
| **Implementation** | Keep existing patterns, no changes needed    |

---

## Components to Remove

| Component               | File                                         | Current Usage                | Replacement           |
| ----------------------- | -------------------------------------------- | ---------------------------- | --------------------- |
| `PageLoader`            | `components/Loading/PageLoader.jsx`          | Full-screen 3 dots + message | **Delete**            |
| `NavigationLoader`      | `components/Navigation/NavigationLoader.jsx` | Full-screen overlay wrapper  | **Delete**            |
| `AdminLoading`          | `dashboard/admin/loading.js`                 | Dashboard loading page       | **Delete**            |
| `LoadingPage` (spinner) | `components/Animation/Cards.jsx`             | CSS spinner in filters       | Replace with skeleton |

---

## Implementation Changes

### Frontend Shell

**File:** `src/app/(frontend)/FrontendShell.jsx`

**Current State:**

```jsx
<NavigationLoader />
```

**Change To:**

```jsx
// Already done - has NavigationProgressBar
// Just need to remove any NavigationLoader references
```

### Dashboard Layout

**File:** `src/app/(dashboard)/dashboard/layout.js`

**Current State:**

```jsx
export default function DashboardLayout({ children }) {
  return (
    <ThemeWrapper>
      <AppProviders>{children}</AppProviders>
    </ThemeWrapper>
  );
}
```

**Change To:**

```jsx
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

### Filter Sections - Replace LoadingPage Spinner

**Files:**

- `src/app/components/Pages/FRONT_END/region/region_filter.jsx`
- `src/app/components/Pages/FRONT_END/region/region_filter_rhf.jsx`
- `src/app/components/Pages/FRONT_END/city/CityFilterSection.jsx`
- `src/app/components/Pages/FRONT_END/city/CityToursSection.jsx`

**Change:**

```jsx
// Before
{
  isLoading && <LoadingPage />;
}

// After - use existing skeleton
{
  isLoading && <ProductCardSkeleton count={6} />;
}
```

### Admin Destination Pages - Remove PageLoader

**Files:**

- `src/app/(dashboard)/dashboard/admin/destinations/countries/[id]/page.js`
- `src/app/(dashboard)/dashboard/admin/destinations/states/[id]/page.js`
- `src/app/(dashboard)/dashboard/admin/destinations/cities/[id]/page.js`
- `src/app/(dashboard)/dashboard/admin/destinations/places/[id]/page.js`

**Change:**

```jsx
// Before
return <PageLoader />;

// After - let the progress bar handle it
return <div>Loading...</div>; // or return null
```

### Delete Files

**Delete completely:**

- `src/app/components/Loading/PageLoader.jsx`
- `src/app/components/Navigation/NavigationLoader.jsx`
- `src/app/(dashboard)/dashboard/admin/loading.js`

---

## Success Criteria

- [ ] Progress bar appears on all route navigation (frontend + dashboard)
- [ ] No full-screen loading overlays remain
- [ ] Filter sections use skeleton loaders instead of spinner
- [ ] No bouncing dot loaders visible anywhere
- [ ] Admin destination pages load with progress bar only
- [ ] All existing functionality preserved

---

## Files Summary

| Action | Count | Files                                       |
| ------ | ----- | ------------------------------------------- |
| Modify | 1     | Dashboard layout                            |
| Modify | 5     | Filter sections (replace spinner)           |
| Modify | 4     | Admin destination pages (remove PageLoader) |
| Delete | 3     | Unused loader components                    |
| Keep   | ~10   | Existing skeleton components                |

**Total: 13 files to modify/delete**
