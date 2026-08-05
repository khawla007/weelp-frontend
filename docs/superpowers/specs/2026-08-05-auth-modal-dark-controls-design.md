# Authentication Modal Dark Controls Design

## What this changes

The authentication popup will keep “Sign Up” and “Back to Login” visually within the heading instead of presenting them as filled buttons in dark mode. They remain real button elements for keyboard and screen-reader behavior, but their visual treatment will be plain underlined text with no background, border, or hover shadow.

The popup backdrop will also use Weelp's deepest page background in dark mode at the existing 80% opacity. Light mode remains unchanged.

## Why the controls look wrong

The global dark-button rule in `src/app/globals.css` intentionally gives real buttons a consistent surface and hover shadow. Its broad native-button selector also catches the two authentication mode switches in `AuthModal.jsx`, even though those controls are designed to read as inline text actions.

The authentication dialog uses the shared dialog overlay, whose default color is `foreground` at 80% opacity. In dark mode that produces a lighter sage-gray veil instead of matching the surrounding dark page canvas.

## Implementation shape

Both authentication mode switches will receive one dedicated semantic class. That class will be excluded from the global dark button surface, transition, and hover-shadow selectors. The component will also declare transparent background and zero border so its intended appearance is explicit at the callsite.

The auth dialog will add a dark-only `bg-background/80` overlay class. This keeps the current opacity, changes only the dark color source, and avoids changing overlays for unrelated dialogs.

No global theme token, form button, close button, login page tab, or light-mode style will change.

## Verification

Component tests will cover both auth views and assert that “Sign Up” and “Back to Login” carry the plain-text switch contract. The authentication dialog layering test will assert its dark-only background overlay at 80% opacity. The global dark-theme contract will verify that the new semantic class is excluded from all three broad button selector groups.

After tests, type-check, and lint, the local authentication popup will be opened in the named visible browser. Dark mode will be checked in both login and signup views, including computed backgrounds, borders, shadows, and the overlay color. Light mode will be checked to confirm its existing overlay and controls remain unchanged.
