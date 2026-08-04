# Single Blog Author Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the single-blog author row's top and horizontal padding while preserving its bottom padding and the hero's 40px mobile handoff.

**Architecture:** Keep the existing shared author component and blog hero. Lock both spacing contracts with focused component tests, then make the minimal Tailwind class replacement on the author wrapper only.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Jest, Testing Library

---

### Task 1: Lock and implement the spacing contract

**Files:**

- Create: `src/app/components/__tests__/singleproductguide.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/singleblog/__tests__/BannerSection.test.jsx`
- Modify: `src/app/components/singleproductguide.jsx:44`

- [ ] **Step 0: Confirm required Next.js guidance**

Read and apply `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` before editing tests or components. These guides are loaded for this plan and confirm that a local class-only change needs no new client boundary, state, or abstraction.

- [ ] **Step 1: Add the failing author-spacing test**

Create `src/app/components/__tests__/singleproductguide.test.jsx`:

```jsx
import { render } from '@testing-library/react';
import { BlogAuthorInfo } from '../singleproductguide';

describe('BlogAuthorInfo', () => {
  it('keeps bottom separation without top or horizontal padding', () => {
    const { container } = render(<BlogAuthorInfo />);
    const author = container.firstChild;

    expect(author).toHaveClass('pb-6');
    expect(author).not.toHaveClass('p-6');
    expect(author).not.toHaveClass('pt-6');
    expect(author).not.toHaveClass('px-6');
    expect(author).not.toHaveClass('pl-6');
    expect(author).not.toHaveClass('pr-6');
    expect(author).not.toHaveClass('lg:px-6');
  });
});
```

Add this test to `BannerSection.test.jsx`:

```jsx
it('keeps the standard 40px mobile hero handoff', () => {
  const { container } = render(<BannerSectionBlog name="Story" />);

  expect(container.querySelector('section')).toHaveClass('mb-10', 'md:mb-16', 'lg:mb-24');
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/__tests__/singleproductguide.test.jsx src/app/components/Pages/FRONT_END/singleblog/__tests__/BannerSection.test.jsx
```

Expected: the hero test passes and the author test fails because the wrapper still uses `p-6`.

- [ ] **Step 3: Apply the minimal class change**

In `src/app/components/singleproductguide.jsx`, change the `BlogAuthorInfo` wrapper from:

```jsx
<div className="max-w-4xl mx-auto p-6 lg:px-6 ">
```

to:

```jsx
<div className="mx-auto max-w-4xl pb-6">
```

- [ ] **Step 4: Verify GREEN**

Rerun the Step 2 test command. Expected: both suites pass without warnings.

- [ ] **Step 5: Run quality and localhost checks**

Invoke `error-handling-patterns`; confirm this class-only change introduces no error path. Then run:

```bash
npm run type-check
npm run lint
```

Ensure the local frontend is running, then open the exact page in the named visible browser before any DOM measurement:

```bash
agent-browser --session weelp-visible --headed open http://localhost:3000/blogs/wildfire-safety-for-travelers-how-to-stay-safe-in-fire-season
agent-browser --session weelp-visible set viewport 390 844
agent-browser --session weelp-visible set viewport 1280 900
```

Visually inspect both widths in the headed window; hidden snapshots must not substitute for this inspection. Expected mobile computed spacing: author top/left/right padding `0px`, bottom padding `24px`, and hero bottom margin `40px`.

- [ ] **Step 6: Complete delivery gates**

Run the mandatory code-review agent, address critical findings, perform the available simplification pass, rerun tests/type-check/lint/browser checks, commit, and push frontend `main`.
