# Weelp Recommendations - Dynamic Featured Itineraries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static FOOTER_EXPLORE_TAGS with dynamic featured itineraries fetched from backend API.

**Architecture:** Convert WeelpRecommendations.jsx to async Server Component that fetches data from getFeaturedItineraries() service. Map up to 32 random items to links using format /cities/{city_slug}/itineraries/{slug}. Hide entire section if no data available.

**Tech Stack:** Next.js 16 Server Components, Laravel API, existing itineraries service

---

## File Structure

| File                                                               | Action    | Responsibility                                                    |
| ------------------------------------------------------------------ | --------- | ----------------------------------------------------------------- |
| `src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx` | Modify    | Async Server Component, fetches and displays featured itineraries |
| `src/app/components/Layout/shellContent.js`                        | Modify    | Remove FOOTER_EXPLORE_TAGS export (no longer needed)              |
| `src/lib/services/itineraries.js`                                  | Reference | Existing getFeaturedItineraries() service (no changes needed)     |

---

## Task 1: Update WeelpRecommendations.jsx to Server Component

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx`

- [ ] **Step 1: Convert component to async Server Component**

Replace the entire file content with:

```jsx
import Link from 'next/link';
import { getFeaturedItineraries } from '@/lib/services/itineraries';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

async function getRandomItems(array, count) {
  if (array.length <= count) return array;
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const WeelpRecommendations = async () => {
  const response = await getFeaturedItineraries();

  // Hide section if no data or error
  if (!response?.success || !response?.data?.length) {
    return null;
  }

  // Get up to 32 random itineraries
  const itineraries = await getRandomItems(response.data, 32);

  return (
    <div className="w-full bg-[#f3f5f6]">
      <div className="w-full px-[60px] py-10">
        <h3 className="text-[18px] text-[#243141] mb-2" style={{ fontFamily: fontIT, fontWeight: 600, letterSpacing: '-0.38px' }}>
          Weelp Recommendations
        </h3>
        <div className="mb-6" style={{ borderTop: '1.3px solid #e3e3e3a6' }} />
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {itineraries.map((itinerary) => {
            const { name, slug, city_slug } = itinerary;
            const href = city_slug ? `/cities/${city_slug}/itineraries/${slug}` : `/cities/itineraries/${slug}`;

            return (
              <Link
                key={`${slug}-${city_slug}`}
                href={href}
                className="text-[16px] text-[#6f7680] transition hover:text-[#243141]"
                style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px', lineHeight: 2.06 }}
              >
                {name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeelpRecommendations;
```

- [ ] **Step 2: Remove static import from page.js**

Open `src/app/(frontend)/page.js` and remove the dynamic import since the component is now a Server Component:

Find this line (around line 16):

```javascript
const WeelpRecommendations = dynamic(() => import('../components/Pages/FRONT_END/home/WeelpRecommendations'));
```

Replace with regular import at top of file:

```javascript
import WeelpRecommendations from '@/app/components/Pages/FRONT_END/home/WeelpRecommendations';
```

- [ ] **Step 3: Run type check**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx src/app/(frontend)/page.js
git commit -m "feat: convert WeelpRecommendations to async Server Component with API data

Fetch featured itineraries from backend API, display up to 32 random items.
Hide section when no data available. Links use /cities/{city}/itineraries/{slug}.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Remove Unused FOOTER_EXPLORE_TAGS

**Files:**

- Modify: `src/app/components/Layout/shellContent.js`

- [ ] **Step 1: Remove FOOTER_EXPLORE_TAGS export**

Open `src/app/components/Layout/shellContent.js` and find the FOOTER_EXPLORE_TAGS array (lines 42-83). Delete the entire array export including all 32 items.

Delete from line 42 through line 83:

```javascript
// Remove all of this:
export const FOOTER_EXPLORE_TAGS = [
  { label: 'Cherry Blossom', href: '/' },
  // ... all 32 items
];
```

- [ ] **Step 2: Verify no other files import FOOTER_EXPLORE_TAGS**

Run: `grep -r "FOOTER_EXPLORE_TAGS" src/ --exclude-dir=node_modules`
Expected: No results (only WeelpRecommendations.jsx was using it, already updated)

- [ ] **Step 3: Run type check**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/components/Layout/shellContent.js
git commit -m "refactor: remove unused FOOTER_EXPLORE_TAGS static export

Replaced with dynamic featured itineraries API.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Verification & Testing

**Files:**

- Test: Manual browser verification

- [ ] **Step 1: Start dev servers**

Backend:

```bash
cd ../backend && php artisan serve --port=8000
```

Frontend (new terminal):

```bash
npm run dev
```

- [ ] **Step 2: Verify homepage loads**

Navigate to: `http://localhost:3000`
Expected: Page loads without errors

- [ ] **Step 3: Verify Weelp Recommendations section**

Scroll to bottom of page, above footer.
Expected outcomes:

- If featured itineraries exist: Section displays with itineraries
- If no featured itineraries: Section is hidden (not visible)
- Layout: 8 columns on large screens, responsive on smaller

- [ ] **Step 4: Verify links work**

Click on a featured itinerary link.
Expected: Navigates to `/cities/{city}/itineraries/{slug}` page

- [ ] **Step 5: Check browser console for errors**

Open browser DevTools Console.
Expected: No errors or warnings

- [ ] **Step 6: Final commit**

```bash
git commit --allow-empty -m "test: verify Weelp Recommendations integration

- Homepage loads correctly
- Section displays/hides based on data
- Links navigate to correct itinerary pages
- No console errors

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Success Criteria Verification

After completing all tasks, verify:

- [ ] Section displays up to 32 featured itineraries
- [ ] Each item links correctly to `/cities/{city}/itineraries/{slug}`
- [ ] Section hides when no data available
- [ ] No hydration errors
- [ ] No TypeScript/linting errors
- [ ] Layout matches current 8-column grid
