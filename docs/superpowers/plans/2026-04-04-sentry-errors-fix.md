# Sentry Errors Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 unresolved Sentry errors in the javascript-nextjs project by resolving missing imports, fixing React child rendering issues, and fixing SSR/SessionProvider context issues.

**Architecture:** Pass session data as props from server components to client components instead of relying on `useSession()` hook during SSR. This prevents hydration mismatches and ensures session context is available during server-side rendering.

**Tech Stack:** Next.js 16 App Router, NextAuth.js, React 19, TypeScript

---

## File Structure

| File | Responsibility | Change Type |
|------|----------------|-------------|
| `src/app/(frontend)/explore/page.js` | Server component for /explore route | Modify - add session fetch |
| `src/app/components/Pages/FRONT_END/explore/ExploreClientWrapper.jsx` | Client wrapper for explore page feed | Modify - accept session prop |
| `src/app/(dashboard)/dashboard/admin/layout.js` | Admin dashboard layout | Modify - pass session to sidebar |
| `src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx` | Admin sidebar component | Modify - accept session prop |

---

## Task 1: Resolve Error 1 in Sentry (JAVASCRIPT-NEXTJS-4)

**Issue:** `WeelpRecommendations is not defined` — already fixed in code

**Files:** None (Sentry dashboard only)

- [ ] **Step 1: Open Sentry issue**

Visit: https://team-fanatic-coders.sentry.io/issues/JAVASCRIPT-NEXTJS-4

- [ ] **Step 2: Verify fix is in place**

The component reference has been removed from `src/app/(frontend)/explore/page.js`.
Current code ends at line 16 with `ExploreClientWrapper` only.

- [ ] **Step 3: Resolve issue in Sentry**

Click "Resolve" button in Sentry dashboard.
Add comment: "Fixed in code — component reference removed from explore/page.js"

---

## Task 2: Defensive Search for Error 2 (JAVASCRIPT-NEXTJS-5)

**Issue:** Objects are not valid as React child `{label, href}`

**Files:** Unknown — search required

- [ ] **Step 1: Search for the pattern**

```bash
cd /home/khawla/Documents/weelp/frontend
grep -rn "href.*label\|label.*href" --include="*.jsx" --include="*.js" src/ | grep -v "node_modules"
```

- [ ] **Step 2: Analyze results**

Look for any location where an object with `{label, href}` structure is being rendered directly as a React child instead of accessing `.label`.

Expected results: May find breadcrumb or navigation components. Check if `item` is rendered directly instead of `item.label`.

- [ ] **Step 3: Fix if found**

If a problematic render is found, change from:
```jsx
{item}  // WRONG — renders entire object
```
To:
```jsx
{item.label}  // CORRECT — renders string property
```

- [ ] **Step 4: Commit if fix applied**

```bash
git add src/path/to/file.jsx
git commit -m "fix: render label property instead of object in ComponentName

Fixes JAVASCRIPT-NEXTJS-5 - Objects are not valid as a React child"
```

- [ ] **Step 5: Update Sentry if fixed**

If fix was applied, resolve JAVASCRIPT-NEXTJS-5 in Sentry with comment referencing the commit.

---

## Task 3: Add auth() to explore page server component

**Issue:** Prepare session data on server for ExploreClientWrapper

**Files:**
- Modify: `src/app/(frontend)/explore/page.js`

- [ ] **Step 1: Add auth import**

Add to imports at top of file:

```javascript
import { auth } from '@/lib/auth/auth';
```

- [ ] **Step 2: Fetch session in server component**

Add this line after the component function declaration:

```javascript
const ExplorePage = async () => {
  const session = await auth();  // ADD THIS LINE
  const postsData = await getExplorePosts(1);
  const initialPosts = postsData?.data || [];
  const lastPage = postsData?.last_page || 1;
```

- [ ] **Step 3: Pass session to ExploreClientWrapper**

Update the JSX to pass session prop:

```javascript
return (
  <>
    <BannerSectionSearchForm title={'Explore Creators'} description={'Discover travel experiences shared by creators. Find inspiration and book your next adventure.'} />

    <ExploreClientWrapper initialPosts={initialPosts} lastPage={lastPage} session={session} />
  </>
);
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/explore/page.js
git commit -m "feat(explore): fetch session on server and pass to ExploreClientWrapper

Prepares for fixing JAVASCRIPT-NEXTJS-6 - useSession SSR error"
```

---

## Task 4: Refactor ExploreClientWrapper to accept session prop

**Issue:** Remove useSession() hook and use passed session prop instead

**Files:**
- Modify: `src/app/components/Pages/FRONT_END/explore/ExploreClientWrapper.jsx`

- [ ] **Step 1: Remove useSession import**

Remove this line from imports (line 4):
```javascript
import { useSession } from 'next-auth/react';
```

- [ ] **Step 2: Add session to props and remove useSession hook**

Update function signature and remove hook call (lines 14-15):

```javascript
// OLD:
export default function ExploreClientWrapper({ initialPosts, lastPage }) {
  const { data: session, update: updateSession } = useSession();

// NEW:
export default function ExploreClientWrapper({ initialPosts, lastPage, session }) {
```

- [ ] **Step 3: Replace session data usage with prop**

Update all references to use the session prop directly (line 22):

```javascript
// OLD:
const isCreator = !!session?.user?.is_creator;
const isLoggedIn = !!session?.user;

// NEW: (stays the same, just using prop instead of hook result)
const isCreator = !!session?.user?.is_creator;
const isLoggedIn = !!session?.user;
```

- [ ] **Step 4: Remove updateSession usage (not needed with prop approach)**

The `performUpgrade` callback uses `updateSession`. Since we're passing session as prop from server, the session will be refreshed on next navigation. Remove the `updateSession` calls:

Find and update `performUpgrade` callback (lines 26-46):

```javascript
const performUpgrade = useCallback(
  async (tokenOverride) => {
    try {
      const config = tokenOverride ? { headers: { Authorization: `Bearer ${tokenOverride}` } } : {};
      const res = await authApi.post('/api/customer/upgrade-to-creator', {}, config);
      if (res.data?.success) {
        toast({ title: "You're now a Creator!", description: 'Welcome to the creator community.' });
        // Remove: await updateSession({ is_creator: true });
        // Session will refresh on next server navigation
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to upgrade.';
      if (err?.response?.status === 422 && msg.toLowerCase().includes('already')) {
        toast({ title: 'You are already a creator!', description: 'Refreshing your session...' });
        // Remove: await updateSession({ is_creator: true });
      } else {
        toast({ title: 'Upgrade failed', description: msg, variant: 'destructive' });
      }
    }
  },
  [toast], // Remove updateSession from dependencies
);
```

- [ ] **Step 5: Commit**

```bash
git add src/app/components/Pages/FRONT_END/explore/ExploreClientWrapper.jsx
git commit -m "refactor(explore): use session prop instead of useSession hook

Fixes JAVASCRIPT-NEXTJS-6 - useSession SSR error on /explore"
```

---

## Task 5: Pass session to AppSidebar in admin layout

**Issue:** Server component has session, needs to pass it to client sidebar

**Files:**
- Modify: `src/app/(dashboard)/dashboard/admin/layout.js`

- [ ] **Step 1: Pass session prop to AppSidebar**

Update the AppSidebar component call (line 18):

```javascript
// OLD:
<AppSidebar />

// NEW:
<AppSidebar session={session} />
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/admin/layout.js
git commit -m "feat(admin): pass session prop to AppSidebar

Prepares for fixing JAVASCRIPT-NEXTJS-7 - useSession SSR error"
```

---

## Task 6: Refactor AppSidebar to accept session prop

**Issue:** Remove useSession() hook and use passed session prop

**Files:**
- Modify: `src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx`

- [ ] **Step 1: Remove useSession import**

Remove this line from imports (line 8):
```javascript
import { useSession } from 'next-auth/react';
```

- [ ] **Step 2: Add session to props and remove useSession hook**

Update function signature and remove hook call (lines 12-14):

```javascript
// OLD:
export function AppSidebar({ ...props }) {
  const { state, open, toggleSidebar, isMobile } = useSidebar();
  const { data: session } = useSession(); //getsssion

// NEW:
export function AppSidebar({ session, ...props }) {
  const { state, open, toggleSidebar, isMobile } = useSidebar();
```

- [ ] **Step 3: Verify session usage**

The component uses `session?.user` but doesn't actually need it for rendering based on current code. The session prop is now available if needed in future.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx
git commit -m "refactor(admin): use session prop instead of useSession hook in AppSidebar

Fixes JAVASCRIPT-NEXTJS-7 - useSession SSR error on /dashboard/admin
Should also resolve JAVASCRIPT-NEXTJS-8 - sidebar.jsx module error (cascading)"
```

---

## Task 7: Testing & Verification

**Issue:** Verify all fixes work and no new errors occur

**Files:** Browser, Sentry dashboard

- [ ] **Step 1: Start dev server**

```bash
cd /home/khawla/Documents/weelp/frontend
npm run dev
```

- [ ] **Step 2: Test /explore page**

1. Open browser to http://localhost:3000/explore
2. Check browser console for errors
3. Verify page loads without hydration errors
4. Verify no "useSession must be wrapped in SessionProvider" errors

- [ ] **Step 3: Test /dashboard/admin page**

1. Open browser to http://localhost:3000/dashboard/admin
2. Check browser console for errors
3. Verify sidebar loads correctly
4. Verify no SSR or hydration errors

- [ ] **Step 4: Run type check**

```bash
npm run type-check
```

Expected: No type errors

- [ ] **Step 5: Run linter**

```bash
npm run lint
```

Expected: No lint errors

- [ ] **Step 6: Run tests**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 7: Verify Sentry**

1. Visit https://team-fanatic-coders.sentry.io/issues/
2. Check for new occurrences of JAVASCRIPT-NEXTJS-6, 7, 8
3. Resolve remaining issues in Sentry if fixes are confirmed

- [ ] **Step 8: Final commit (if any adjustments needed)**

```bash
git add .
git commit -m "test: verify Sentry error fixes - all tests passing"
```

---

## Task 8: Documentation & Cleanup

**Issue:** Update spec status and document completion

**Files:**
- Modify: `docs/superpowers/specs/2026-04-04-sentry-errors-fix-design.md`

- [ ] **Step 1: Update spec status**

Change status from "Approved" to "Completed" in the spec document.

- [ ] **Step 2: Commit spec update**

```bash
git add docs/superpowers/specs/2026-04-04-sentry-errors-fix-design.md
git commit -m "docs: mark Sentry errors fix spec as completed"
```

---

## Summary

| Task | Description | Estimated Time |
|------|-------------|----------------|
| 1 | Resolve Error 1 in Sentry | 2 min |
| 2 | Defensive search for Error 2 | 10 min |
| 3 | Add auth() to explore page | 5 min |
| 4 | Refactor ExploreClientWrapper | 10 min |
| 5 | Pass session to AppSidebar | 2 min |
| 6 | Refactor AppSidebar | 5 min |
| 7 | Testing & verification | 10 min |
| 8 | Documentation | 2 min |
| **Total** | | **~46 minutes** |
