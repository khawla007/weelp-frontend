# Admin blog filter controls

## Why this change

The admin blog index currently places a static `Recommended` label at the left of the results toolbar while the actual sort control is stacked below **Add New** on the right. The Category and Tags filters also place a select menu inside an accordion, so choosing either filter requires opening two dropdown-style controls.

## Approved design

Keep the existing filtering data flow and simplify only the controls in `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/FilterBlogPage.jsx`.

- Remove the static `Recommended` text.
- Move the existing `sort_by` select into that left-hand toolbar position and give it an accessible **Sort blogs** label.
- Keep **Add New**, and the bulk actions that replace it after selecting blogs, in the right-hand position.
- Replace the Category and Tags accordion wrappers with two always-visible labeled select controls. Each filter therefore opens one menu instead of an accordion followed by a menu.
- Preserve the current category, tag, sort, search, pagination, loading, error, empty, bulk-action, and responsive behavior.
- Correct the Tags empty-state condition and copy so it uses `tagList` and says `No tags found`.
- Do not introduce a new component or change API requests.

On narrow screens, the toolbar may wrap, but Sort remains before the right-hand action area in document order. On large screens, Sort and the action remain on opposite sides.

## Verification

Add a focused component test that mocks the option hooks and blog response, then proves:

- `Recommended` is absent;
- Sort appears before **Add New** and exposes the existing choices;
- Category and Tags each render one combobox without accordion triggers;
- category and tag empty states use their matching data sources.

Run the focused Jest test, frontend type-check, lint, and relevant broader tests. Finally, use the visible headed browser against `http://localhost:3000/dashboard/admin/blogs` to verify the desktop and narrow layouts and confirm each filter requires one click to open.
