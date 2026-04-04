# Sentry Errors Fix - Design Spec

**Date:** 2026-04-04
**Status:** Approved
**Related Issues:** JAVASCRIPT-NEXTJS-4, JAVASCRIPT-NEXTJS-5, JAVASCRIPT-NEXTJS-6, JAVASCRIPT-NEXTJS-7, JAVASCRIPT-NEXTJS-8

---

## Overview

Fix the 5 unresolved Sentry errors in the `javascript-nextjs` project. After root cause analysis, these resolve to **3 unique issues**:

| Sentry Issue | Root Cause | Fix Type | Complexity |
|--------------|------------|----------|------------|
| JAVASCRIPT-NEXTJS-4 | Missing import (already fixed) | Sentry resolve only | None |
| JAVASCRIPT-NEXTJS-5 | Object rendered as React child `{label, href}` | Defensive search + fix if found | Quick |
| JAVASCRIPT-NEXTJS-6 | `useSession()` SSR failure on `/explore` | Pass session as props | Moderate |
| JAVASCRIPT-NEXTJS-7 | `useSession()` SSR failure on `/dashboard/admin` | Pass session as props | Moderate |
| JAVASCRIPT-NEXTJS-8 | sidebar.jsx module SSR error | Cascading from #7 | Auto-resolves |

---

## Root Cause Analysis

### Error 1: WeelpRecommendations is not defined
- **File:** `src/app/(frontend)/explore/page.js:17`
- **Status:** Already fixed in code
- **Action:** Resolve in Sentry only

### Error 2: Objects are not valid as React child
- **Page:** `/explore` (client-side)
- **Pattern:** `{label, href}` object rendered directly instead of accessing `.label`
- **Status:** Active, but exact location not found in current code (may be transient HMR issue)
- **Action:** Defensive grep search to locate and fix

### Errors 3, 4, 5: useSession SSR failures
- **Root Cause:** Client components call `useSession()` during server-side pre-rendering before `SessionProvider` context is available
- **Affected Components:**
  - `ExploreClientWrapper.jsx` (line 15)
  - `app-sidebar.jsx` (line 14)
- **Cascading Error:** `sidebar.jsx` module factory error (Error 5) stems from Error 4

---

## Architecture Changes

### Current Flow (Broken)

```
┌─────────────────┐      ┌──────────────────┐
│ Server Component │ ───► │ Client Component │ ──X─► useSession() fails
│                 │      │ calls useSession()│     during SSR
└─────────────────┘      └──────────────────┘
```

### Fixed Flow

```
┌─────────────────┐      ┌──────────────────┐
│ Server Component │ ───► │ Client Component │ ───► receives session prop
│ await auth()     │      │ uses session prop │      (no hook call during SSR)
└─────────────────┘      └──────────────────┘
```

---

## Implementation Details

### Error 1: Resolve in Sentry (JAVASCRIPT-NEXTJS-4)
- Action: Mark as resolved in Sentry dashboard
- No code change needed

### Error 2: Defensive Search (JAVASCRIPT-NEXTJS-5)
```bash
# Search for any {label, href} objects being rendered directly
grep -r "href.*label\|label.*href" --include="*.jsx" --include="*.js" src/
```
- Find the component rendering the object directly
- Fix: Access `.label` property instead of rendering the entire object

### Errors 3, 4, 5: Pass Session as Props

| File | Change |
|------|--------|
| `src/app/(frontend)/explore/page.js` | Add `const session = await auth();`, pass to `ExploreClientWrapper` |
| `src/app/components/Pages/FRONT_END/explore/ExploreClientWrapper.jsx` | Accept `session` prop, remove `useSession()` call, use prop directly |
| `src/app/(dashboard)/dashboard/admin/layout.js` | Pass `session` to `AppSidebar` |
| `src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx` | Accept `session` prop, remove `useSession()` call |

#### Code Changes

**explore/page.js:**
```javascript
// Add import
import { auth } from '@/lib/auth/auth';

// In component
const ExplorePage = async () => {
  const session = await auth(); // Add this
  const postsData = await getExplorePosts(1);
  // ...

  return (
    <>
      <BannerSectionSearchForm ... />
      <ExploreClientWrapper
        initialPosts={initialPosts}
        lastPage={lastPage}
        session={session} // Add this
      />
    </>
  );
};
```

**ExploreClientWrapper.jsx:**
```javascript
// Remove: import { useSession } from 'next-auth/react';
// Add: session prop
export default function ExploreClientWrapper({ initialPosts, lastPage, session }) {
  // Remove: const { data: session, update: updateSession } = useSession();
  // Use session prop directly instead
  const isCreator = !!session?.user?.is_creator;
  // ...
}
```

**admin/layout.js:**
```javascript
// Pass session to AppSidebar
<AppSidebar session={session} />
```

**app-sidebar.jsx:**
```javascript
// Remove: import { useSession } from 'next-auth/react';
// Add: session prop
export function AppSidebar({ session, ...props }) {
  // Remove: const { data: session } = useSession();
  // Use session prop directly
  // ...
}
```

---

## Testing

1. Visit `/explore` — should load without SSR errors
2. Visit `/dashboard/admin` — should load without SSR errors
3. Verify no new Sentry occurrences after testing
4. Check browser console for hydration errors

---

## Error Handling & Edge Cases

**Session null handling:**
- Server component: `auth()` returns `null` for unauthenticated users — pass through
- Client components: Handle `session === null` gracefully (existing logic already does this)

**Rollback plan:**
- Changes are isolated to 4 files
- If issues arise, revert individual commits
- No database or config changes

---

## Estimated Time

| Task | Time |
|------|------|
| Error 1: Sentry resolve | 2 min |
| Error 2: Defensive search + fix | 10 min |
| Errors 3-5: Session prop changes | 20 min |
| Testing | 10 min |
| **Total** | **~45 minutes** |
