# Adding Dark-Mode-Safe Components

Use semantic tokens from the start. A component should keep the same role names in light and dark mode; the token layer handles the actual color swap.

## Component Rules

1. Start surfaces with `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, or a named state token.
2. Use `text-foreground` for primary copy and `text-muted-foreground` or `text-copy` for secondary copy.
3. Use `border-border`, `divide-border`, and tokenized state borders.
4. Keep brand actions on `bg-weelp-sage-deep` with `hover:bg-weelp-sage-hover`.
5. Do not add new `bg-white`, `bg-black`, gray/zinc/neutral/slate color utilities, arbitrary hex color utilities, or inline literal hex colors.
6. If a third-party brand color or external embed requires a literal, add `dark-mode-exempt: <reason>` directly above the line and record the reason in QA notes.
7. For card shadows, prefer the existing card primitive. If a custom shadow is necessary, include a dark-mode behavior such as `dark:shadow-none`.
8. For rich text, maps, Stripe, charts, and toasts, wire theme from tokens or `useTheme().resolvedTheme`; do not leave injected surfaces locked to light colors.

## Review Checklist

- `npm run dark:audit` has no new unreviewed findings.
- `npm run lint` passes the dark guard.
- Light and dark modes have readable foreground/background contrast.
- Theme persistence works with `localStorage['weelp-theme']`.
- System mode follows browser or OS preference.
- Any exemption has a direct comment and a documented reason.

## Intentional Exemption Format

```jsx
// dark-mode-exempt: third-party brand color must match provider guidelines
<Star className="fill-[#fed141] text-[#fed141]" />
```

Keep exemptions rare. They are for brand marks, provider-owned UI, or cases where the literal color is the product signal.
