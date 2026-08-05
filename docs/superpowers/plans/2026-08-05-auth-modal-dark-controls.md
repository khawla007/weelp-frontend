# Authentication Modal Dark Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the authentication mode switches visually text-like in dark mode and make the auth popup's dark backdrop use the page background at the existing 80% opacity.

**Architecture:** Give the two inline auth switches one dedicated semantic class, exclude it from all broad dark-button contracts, and declare transparent styling at the component callsite. Scope the overlay override to `AuthModalDialog` so other dialogs and light mode retain their current behavior.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Radix Dialog, Jest, Testing Library

**Working Directory:** Run every command from the `frontend/` repository root.

---

### Task 1: Protect the authentication mode switches from global button styling

**Files:**

- Modify: `src/app/components/Form/__tests__/AuthModal.mobile.test.jsx`
- Modify: `src/app/__tests__/deepForestTheme.test.js`
- Modify: `src/app/components/Form/AuthModal.jsx:45-64`
- Modify: `src/app/globals.css:309-331`

- [ ] **Step 1: Write failing component and selector-contract tests**

In `AuthModal.mobile.test.jsx`, extend the existing auth-switch test so both controls must carry the semantic class and explicit transparent styling:

```jsx
expect(signUpSwitch).toHaveClass('weelp-auth-mode-switch', 'border-0', 'bg-transparent');

fireEvent.click(signUpSwitch);

const loginSwitch = screen.getByRole('button', { name: /back to login/i });
expect(loginSwitch).toHaveClass('weelp-auth-mode-switch', 'border-0', 'bg-transparent');
```

In `deepForestTheme.test.js`, add an auth-mode button to the dark interactive fixture:

```html
<button data-testid="auth-mode-switch" class="weelp-auth-mode-switch">Sign Up</button>
```

Keep the expected selected controls unchanged so the test proves the auth switch is excluded from the transition and hover contract. Update the expected exact native-button selectors in the surface, resting-transition, and hover arrays to include `:not(.weelp-auth-mode-switch)`.

- [ ] **Step 2: Run the focused tests and confirm the regression is exposed**

Run:

```bash
npx jest src/app/components/Form/__tests__/AuthModal.mobile.test.jsx src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: FAIL because the auth controls do not carry the new class and the broad global selectors do not exclude it.

- [ ] **Step 3: Implement the scoped auth-switch contract**

Add the following classes to both “Sign Up” and “Back to Login” buttons in `AuthModal.jsx`:

```text
weelp-auth-mode-switch border-0 bg-transparent
```

Add `:not(.weelp-auth-mode-switch)` to the native-button selector in all three relevant groups in `globals.css`: surface, resting transition, and hover shadow. Do not change anchor selectors, theme tokens, form-submit buttons, close controls, or light-mode rules.

- [ ] **Step 4: Run the focused tests and confirm they pass**

Run:

```bash
npx jest src/app/components/Form/__tests__/AuthModal.mobile.test.jsx src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: both suites pass.

### Task 2: Align the dark authentication overlay

**Files:**

- Modify: `src/app/components/Modals/__tests__/AuthModalDialog.layering.test.jsx`
- Modify: `src/app/components/Modals/AuthModalDialog.jsx:55`

- [ ] **Step 1: Write the failing dark-overlay regression test**

Extend the existing layering test with:

```jsx
expect(overlay).toHaveClass('z-[100020]', 'dark:bg-background/80');
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npx jest src/app/components/Modals/__tests__/AuthModalDialog.layering.test.jsx --runInBand
```

Expected: FAIL because the authentication overlay currently has only its z-index override.

- [ ] **Step 3: Add the auth-dialog-only dark overlay class**

Change the `DialogContent` overlay class to:

```jsx
<DialogContent overlayClassName="z-[100020] dark:bg-background/80" />
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```bash
npx jest src/app/components/Modals/__tests__/AuthModalDialog.layering.test.jsx --runInBand
```

Expected: PASS.

### Task 3: Verify, review, and integrate

**Files:**

- Verify only: all six implementation and test files above

- [ ] **Step 1: Apply the error-handling review**

Invoke `error-handling-patterns` and confirm the styling-only change adds no async operation, error boundary, or recovery path.

- [ ] **Step 2: Run the full relevant test set**

Run:

```bash
npx jest src/app/components/Form/__tests__/AuthModal.mobile.test.jsx src/app/components/Modals/__tests__/AuthModalDialog.layering.test.jsx src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: all three suites pass.

- [ ] **Step 3: Run static verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit successfully.

- [ ] **Step 4: Verify both modal views in the visible browser**

Open or reuse `agent-browser --session weelp-visible --headed` on localhost and trigger the authentication popup from an unauthenticated action. In dark mode, verify both “Sign Up” and “Back to Login” compute to transparent backgrounds, zero-width borders, and no box shadow at rest or hover. Verify the overlay uses the computed `background` color at 80% opacity. Switch to light mode and confirm its existing overlay and switch appearance remain unchanged. Check desktop and 320-by-900 viewport containment.

- [ ] **Step 5: Review, simplify, and re-verify**

Run the mandatory code-review gate and address critical or major findings until approved. Invoke `simplify`; if unavailable, perform the documented manual clarity/reuse/efficiency fallback. Then repeat Steps 1 through 4 before committing.

- [ ] **Step 6: Commit and push `main`**

Stage only the six implementation/test files and commit:

```bash
git add 'src/app/components/Form/AuthModal.jsx' 'src/app/components/Form/__tests__/AuthModal.mobile.test.jsx' 'src/app/components/Modals/AuthModalDialog.jsx' 'src/app/components/Modals/__tests__/AuthModalDialog.layering.test.jsx' 'src/app/globals.css' 'src/app/__tests__/deepForestTheme.test.js'
git commit -m "fix(auth): refine dark modal controls"
git push origin main
```
