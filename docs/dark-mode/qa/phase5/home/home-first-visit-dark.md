# Home Dark-Default Check

Visible browser session:

`agent-browser --session weelp-deep-forest-visible`

Checks performed:

- Missing preference: removed `weelp-theme`, reloaded, and verified `html.dark` before content became visible.
- Flash prevention: observed no light canvas between navigation and the rendered homepage.
- Saved light: selected Light, reloaded, and verified `weelp-theme='light'` with `html.light`.
- Legacy value: set `weelp-theme='system'`, reloaded, and verified normalization to `dark`.
- Corrupt value: set an unsupported value, reloaded, and verified normalization to `dark`.
- Storage denial: covered by `themeConfig.test.js`; the bootstrap applies `html.dark` even when storage throws.

Visual artifacts remain:

- `home-light-desktop.png`
- `home-dark-desktop.png`
- `home-light-mobile.png`
- `home-dark-mobile.png`
