# Home System Theme Check

Visible browser session:

```bash
agent-browser --session weelp-visible --headed --args "--no-sandbox" open http://localhost:3000/
```

Checks performed:

- Dark persistence: set `localStorage['weelp-theme']='dark'`, reloaded, verified `html.dark`.
- Light persistence: set `localStorage['weelp-theme']='light'`, reloaded, verified `html.light`.
- System dark: set browser media to dark, set `localStorage['weelp-theme']='system'`, reloaded, verified `matchMedia('(prefers-color-scheme: dark)').matches === true` and `html.dark`.
- System light: set browser media to light, reloaded, verified `matchMedia('(prefers-color-scheme: dark)').matches === false` and `html.light`.

Artifacts:

- `home-light-desktop.png`
- `home-dark-desktop.png`
- `home-light-mobile.png`
- `home-dark-mobile.png`
