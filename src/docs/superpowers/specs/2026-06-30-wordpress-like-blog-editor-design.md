# WordPress-Like Blog Editor Design

**Date:** 2026-06-30
**Status:** Draft for review
**Author:** Codex + User

---

## Refined Execution Prompt

Build a WordPress-like editor for Weelp admin blogs that keeps the current Laravel blog API contract stable, improves authoring speed, and prevents invalid publish attempts. Preserve existing Tiptap JSON content, SEO fields, media library integration, categories, tags, preview, and publish status. Prefer focused, testable steps over a full rewrite.

---

## Current Findings

The current blog editor is functional but limited. It uses Tiptap through `RichTextEditor.jsx`, stores body content as JSON in `blogs.content`, and sends create/update requests through `src/lib/actions/blogs.js` to the Laravel admin blog API.

The concrete bug found during inspection was publish readiness drift: `Create` became enabled after only title, slug, and body were present, even though the editor still required excerpt, media, category, and tag input. That was fixed separately by making the create button match the actual create payload requirements.

---

## Goals

1. Make writing feel close to WordPress: fast title entry, large canvas, familiar formatting, media insertion, preview, and clear publish controls.
2. Keep the existing backend payload contract stable: `name`, `slug`, `content`, `excerpt`, `publish`, `media_gallery`, `categories`, `tags`, and `seo`.
3. Preserve existing Tiptap JSON content and legacy plain-text content handling.
4. Add autosave drafts so accidental navigation does not lose work.
5. Add a publish readiness panel that shows exactly what remains before creating or publishing.
6. Improve editor coverage with tests for content parsing, toolbar actions, readiness, autosave, and payload transformation.

---

## Non-Goals

1. Do not replace Laravel blog tables.
2. Do not migrate existing content to a new format.
3. Do not build WordPress plugin compatibility.
4. Do not add collaborative editing in this phase.
5. Do not introduce AI writing generation unless a separate AI content spec is approved.
6. Do not build a Gutenberg-style block inserter in this phase.
7. Do not add server-side draft storage in this phase.

---

## User Experience

The editor should open directly into a writing surface. The title and body should dominate the page, while publishing controls, excerpt, media, taxonomy, and SEO stay organized in a right sidebar.

This phase should follow the classic WordPress editor model: a single body canvas with a familiar toolbar and publishing sidebar. A Gutenberg-style block inserter can be evaluated later after the classic editor is stable.

The toolbar should support common WordPress-style actions:

- Paragraph, heading 1, heading 2, heading 3
- Bold, italic, strikethrough, inline code
- Bullet list, ordered list, blockquote
- Link add/remove
- Image insertion from the existing media library
- Undo and redo
- Horizontal rule

The publish area should clearly show readiness:

- Title
- Slug
- Body content
- Excerpt
- Featured/media image
- Category
- Tag

`Create` should remain disabled until required fields are ready. `Preview` can remain available once body content exists, because previewing a draft before all publishing fields are ready is useful.

---

## Architecture

### Editor Core

Keep Tiptap as the editor engine because it is already installed, stores structured JSON, and integrates with the existing `RichTextRenderer`. Expand the shared editor instead of restoring the old blog-local `Tiptap.jsx`.

Primary files:

- `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/RichTextEditor.jsx`
- `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/richTextContent.js`
- `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/RichTextRenderer.jsx`

### Blog Form

Keep `BlogForm.jsx` as the submit orchestrator, but extract payload normalization into a small pure helper so it can be tested without mounting the full dashboard form.

Primary files:

- `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/BlogForm.jsx`
- `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/BlogMain.jsx`
- `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/Sidebar.jsx`
- `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/components/BlogHeader.jsx`

### Draft State

Autosave should use local storage in this phase, keyed by create/edit route and blog id:

- Create key: `weelp:blog-editor-draft:new`
- Edit key: `weelp:blog-editor-draft:<id>`

Autosave should store form values, not HTML. On load, if a draft is newer than server data, show a restore/discard prompt. After a successful create or update, clear the matching local draft key. Server-side drafts and revision history should be a later phase if admins need cross-device recovery or audit history.

### Backend Contract

No schema migration is required for the WordPress-like editor phase. The backend should continue validating meaningful rich text via `App\Support\RichTextContent` and exposing content unchanged through admin/public blog endpoints.

---

## Error Handling

- Invalid rich-text JSON falls back to an empty editor document in the editor.
- Legacy plain text remains valid and renderable.
- Failed save shows backend validation messages by field where possible.
- Autosave restore failures should not block editing; they should clear the bad draft and continue.
- Media insertion should reject empty media URLs and keep the editor unchanged.

---

## Testing Strategy

Frontend tests:

- `isBlogCreateReady` requires all create fields.
- Payload normalization maps react-select options to backend ids.
- `RichTextEditor` emits JSON after editing and media insertion.
- Toolbar actions call Tiptap commands and update content.
- Autosave writes, restores, and discards draft state.
- `RichTextRenderer` renders headings, lists, links, blockquotes, images, and legacy text.

Backend tests:

- Blog create rejects empty rich text.
- Blog create rejects missing required publish dependencies.
- Blog show returns content unchanged.
- Blog update preserves omitted fields.

Manual browser checks:

- Login as admin.
- Open `/dashboard/admin/blogs/new`.
- Confirm title + body alone does not enable `Create`.
- Fill required sidebar fields and confirm `Create` enables.
- Insert an image into the editor body and confirm preview renders it.
- Refresh with unsaved draft and confirm restore/discard prompt.

---

## Success Criteria

- Authors can write and format a blog post without leaving the main editor canvas.
- The editor feels familiar to a WordPress user for core writing and publishing tasks.
- Invalid create attempts are prevented before submit.
- Existing blog content continues to load, edit, preview, and render.
- Autosave protects unsaved drafts.
- Focused frontend and backend tests cover the editor contract.
