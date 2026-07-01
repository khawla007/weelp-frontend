# WordPress-Like Blog Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Weelp admin blog editor into a classic WordPress-like writing and publishing experience while preserving the current Laravel blog API contract.

**Architecture:** Keep Tiptap as the editor engine, expand the shared `RichTextEditor`, and keep Laravel storing Tiptap JSON in `blogs.content`. Use local-only autosave for this phase, clear drafts after successful save, and leave server-side drafts plus Gutenberg-style blocks for later phases. Extract form payload/readiness helpers so publishing behavior can be tested without mounting the whole dashboard.

**Tech Stack:** Next.js App Router, React Hook Form, Tiptap, Laravel 12, PHPUnit, Jest, Testing Library.

---

## File Structure

| File                                                                                  | Action | Responsibility                                   |
| ------------------------------------------------------------------------------------- | ------ | ------------------------------------------------ |
| `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/RichTextEditor.jsx`       | Modify | WordPress-like toolbar and editor commands       |
| `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/rich-text-editor.css`     | Modify | Editor canvas and content styles                 |
| `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/richTextContent.js`       | Modify | Content parsing and content checks               |
| `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/RichTextRenderer.jsx`     | Modify | Public rendering parity for new editor nodes     |
| `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/blogPayload.js`       | Create | Normalize blog form values into backend payloads |
| `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/useBlogAutosave.js`   | Create | Local draft autosave and restore/discard logic   |
| `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/BlogForm.jsx`         | Modify | Use payload helper and autosave hook             |
| `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/BlogMain.jsx`              | Modify | Larger writing canvas and editor integration     |
| `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/Sidebar.jsx`               | Modify | Publish readiness and field validation           |
| `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/components/BlogHeader.jsx` | Modify | Header actions, preview, publish readiness       |
| `tests/Feature/Admin/BlogAdminTest.php`                                               | Modify | Backend contract coverage                        |

---

## Task 1: Payload Normalization Helper

**Files:**

- Create: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/blogPayload.js`
- Test: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/__tests__/blogPayload.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
import { normalizeBlogPayload } from '../blogPayload';

test('normalizes blog form values for Laravel create/update requests', () => {
  const payload = normalizeBlogPayload({
    name: 'Dubai Guide',
    slug: 'dubai-guide',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Body"}]}]}',
    excerpt: 'Short excerpt',
    publish: true,
    media_gallery: [{ media_id: 10, url: '/media.jpg', is_featured: true }],
    categories: [{ value: 2, label: 'Travel' }],
    tags: [{ value: 3, label: 'Guide' }],
    seo: { meta_title: 'Dubai Guide' },
  });

  expect(payload).toMatchObject({
    name: 'Dubai Guide',
    slug: 'dubai-guide',
    excerpt: 'Short excerpt',
    publish: true,
    media_gallery: [{ media_id: 10, is_featured: true }],
    categories: [2],
    tags: [3],
    seo: { meta_title: 'Dubai Guide' },
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

```bash
CI=1 npm test -- --runTestsByPath src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/__tests__/blogPayload.test.js --runInBand --watch=false
```

Expected: FAIL because `blogPayload.js` does not exist.

- [ ] **Step 3: Implement the helper**

```javascript
export const normalizeBlogPayload = (data = {}) => ({
  ...data,
  media_gallery: Array.isArray(data.media_gallery)
    ? data.media_gallery.map((media) => ({
        media_id: media.media_id ?? media.id,
        is_featured: media.is_featured ?? false,
      }))
    : [],
  categories: Array.isArray(data.categories) ? data.categories.map((category) => category.value ?? category.id).filter(Boolean) : [],
  tags: Array.isArray(data.tags) ? data.tags.map((tag) => tag.value ?? tag.id).filter(Boolean) : [],
});
```

- [ ] **Step 4: Wire `BlogForm.jsx` to use the helper**

Replace inline `finalData` mapping with:

```javascript
const finalData = normalizeBlogPayload(data);
```

- [ ] **Step 5: Run focused tests**

```bash
CI=1 npm test -- --runTestsByPath src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/__tests__/blogPayload.test.js --runInBand --watch=false
```

Expected: PASS.

---

## Task 2: WordPress-Like Toolbar

**Files:**

- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/RichTextEditor.jsx`
- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/rich-text-editor.css`
- Test: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/__tests__/RichTextEditor.test.jsx`

- [ ] **Step 1: Add failing tests for undo, redo, horizontal rule, and paragraph/heading controls**

Add tests that mount `RichTextEditor`, click the new controls by accessible name, and assert `onChange` receives expected Tiptap JSON. Use the emitted JSON node types `paragraph`, `heading`, `horizontalRule`, `bulletList`, `orderedList`, `blockquote`, `image`, and link marks only in this phase.

- [ ] **Step 2: Run the test and verify it fails**

```bash
CI=1 npm test -- --runTestsByPath src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/__tests__/RichTextEditor.test.jsx --runInBand --watch=false
```

Expected: FAIL because the new controls are not present.

- [ ] **Step 3: Add toolbar controls and required Tiptap extensions**

Import the required extension before adding the button:

```javascript
import HorizontalRule from '@tiptap/extension-horizontal-rule';
```

Add it to `editorExtensions`:

```javascript
HorizontalRule,
```

Use lucide icons for undo, redo, paragraph, heading 1, heading 2, heading 3, horizontal rule, quote, lists, link, unlink, and image. Keep each button `type="button"` and give each one a clear `aria-label`.

- [ ] **Step 4: Improve editor canvas styling**

Set the editor body to a larger writing area with comfortable line length:

```css
.rich-text-editor-content {
  min-height: 420px;
  max-width: 760px;
  margin: 0 auto;
  font-size: 1rem;
  line-height: 1.75;
}
```

- [ ] **Step 5: Run focused tests**

```bash
CI=1 npm test -- --runTestsByPath src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/__tests__/RichTextEditor.test.jsx --runInBand --watch=false
```

Expected: PASS.

---

## Task 3: Autosave Drafts

**Files:**

- Create: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/useBlogAutosave.js`
- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/BlogForm.jsx`
- Test: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/__tests__/useBlogAutosave.test.jsx`

- [ ] **Step 1: Write failing tests**

Test that the hook writes form values to `localStorage`, restores a newer draft, discards a draft when requested, ignores malformed draft JSON, and clears the matching draft after successful save.

- [ ] **Step 2: Run the test and verify it fails**

```bash
CI=1 npm test -- --runTestsByPath src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/__tests__/useBlogAutosave.test.jsx --runInBand --watch=false
```

Expected: FAIL because the hook does not exist.

- [ ] **Step 3: Implement autosave hook**

Use a debounced effect around `watch()` values. Store `{ savedAt, values }` under `weelp:blog-editor-draft:new` or `weelp:blog-editor-draft:<id>`. For edit pages, compare `savedAt` against `blogData.updated_at`; only offer restore when the local draft is newer. If draft JSON is malformed, remove it and continue without blocking the editor. Expose a `clearDraft()` function and call it after successful create/update.

- [ ] **Step 4: Add restore/discard UI in `BlogForm.jsx`**

Show a small alert above the form when a draft exists:

```jsx
<div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
  Unsaved draft found.
  <Button type="button" onClick={restoreDraft}>
    Restore
  </Button>
  <Button type="button" variant="ghost" onClick={discardDraft}>
    Discard
  </Button>
</div>
```

- [ ] **Step 5: Run focused tests**

```bash
CI=1 npm test -- --runTestsByPath src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/__tests__/useBlogAutosave.test.jsx --runInBand --watch=false
```

Expected: PASS.

---

## Task 4: Publish Readiness Panel

**Files:**

- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/Sidebar.jsx`
- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/components/BlogHeader.jsx`
- Test: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/components/__tests__/BlogHeader.test.jsx`

- [ ] **Step 1: Extend readiness tests**

Add concrete cases for missing excerpt, missing media, missing category, missing tag, and fully ready payload.

- [ ] **Step 2: Run the test and verify it fails for missing cases not covered**

```bash
CI=1 npm test -- --runTestsByPath src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/components/__tests__/BlogHeader.test.jsx --runInBand --watch=false
```

Expected: FAIL until readiness helper covers every field.

- [ ] **Step 3: Add sidebar readiness panel**

Render a compact checklist for Title, Slug, Body, Excerpt, Media, Category, and Tag. Use neutral text and check icons; do not add explanatory marketing copy. Keep the checklist in `Sidebar.jsx`; keep the pure readiness function in `BlogHeader.jsx` or move it to a helper if it becomes shared.

- [ ] **Step 4: Run focused tests**

```bash
CI=1 npm test -- --runTestsByPath src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/components/__tests__/BlogHeader.test.jsx --runInBand --watch=false
```

Expected: PASS.

---

## Task 5: Renderer Parity

**Files:**

- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/RichTextRenderer.jsx`
- Test: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/__tests__/RichTextRenderer.test.jsx`

- [ ] **Step 1: Add failing renderer tests**

Cover this exact node/mark set emitted by the phase-1 editor: `paragraph`, `heading`, `bulletList`, `orderedList`, `listItem`, `blockquote`, `horizontalRule`, `image`, text marks for `bold`, `italic`, `strike`, `code`, and `link`, plus legacy plain text.

- [ ] **Step 2: Run the test and verify it fails for missing node types**

```bash
CI=1 npm test -- --runTestsByPath src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/__tests__/RichTextRenderer.test.jsx --runInBand --watch=false
```

Expected: FAIL for unsupported new nodes.

- [ ] **Step 3: Implement renderer support**

Add cases for every node type emitted by the upgraded phase-1 editor. Preserve existing output for legacy content. Do not add renderer branches for future block inserter nodes in this phase.

- [ ] **Step 4: Run focused tests**

```bash
CI=1 npm test -- --runTestsByPath src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/__tests__/RichTextRenderer.test.jsx --runInBand --watch=false
```

Expected: PASS.

---

## Task 6: Backend Contract Verification

**Files:**

- Modify: `tests/Feature/Admin/BlogAdminTest.php`

- [ ] **Step 1: Add backend tests**

Add tests for:

- Create stores Tiptap JSON unchanged.
- Show returns Tiptap JSON unchanged.
- Empty rich-text content is rejected.
- Empty media/category/tag dependencies are rejected.

- [ ] **Step 2: Run backend tests**

```bash
php artisan test tests/Feature/Admin/BlogAdminTest.php
```

Expected: PASS.

---

## Task 7: Manual Browser Verification

**Files:** none

- [ ] **Step 1: Open visible browser**

```bash
agent-browser --session weelp-visible --headed --args "--no-sandbox" open http://localhost:3000/dashboard/admin/blogs/new
```

Expected: Visible Chrome opens on the blog editor. If already logged out, log in as an admin first.

- [ ] **Step 2: Verify invalid create path**

Fill only title and body.

Expected: `Preview` is enabled, `Create` is disabled.

- [ ] **Step 3: Verify valid create path**

Fill excerpt, select at least one media item, category, and tag.

Expected: `Create` is enabled.

- [ ] **Step 4: Verify autosave**

Type title/body, refresh before saving, and restore draft.

Expected: Draft restore returns the typed values.

- [ ] **Step 5: Verify preview**

Insert formatted content and an image, click Preview.

Expected: Preview renders body formatting and image.

---

## Self-Review

Spec coverage: the plan covers payload normalization, richer toolbar, autosave, readiness, renderer parity, backend contract, and browser verification.

Placeholder scan: no `TBD`, `TODO`, or unspecified implementation steps remain.

Type consistency: field names match the existing blog form and Laravel API contract: `name`, `slug`, `content`, `excerpt`, `publish`, `media_gallery`, `categories`, `tags`, `seo`.
