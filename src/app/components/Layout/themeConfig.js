export const DEFAULT_THEME = 'dark';
export const EXPLICIT_THEMES = ['light', 'dark'];
export const THEME_STORAGE_KEY = 'weelp-theme';
export const THEME_COLORS = {
  dark: '#08110e',
  light: '#ffffff',
};

export function resolveExplicitTheme(theme) {
  return theme === 'light' ? 'light' : DEFAULT_THEME;
}

const SERIALIZED_DEFAULT_THEME = JSON.stringify(DEFAULT_THEME);
const SERIALIZED_THEME_COLORS = JSON.stringify(THEME_COLORS);
const SERIALIZED_THEME_STORAGE_KEY = JSON.stringify(THEME_STORAGE_KEY);

export const THEME_BOOTSTRAP_SCRIPT = `(function () {
  var root = document.documentElement;
  var theme = ${SERIALIZED_DEFAULT_THEME};
  var themeColors = ${SERIALIZED_THEME_COLORS};
  var shouldPersist = true;
  var shouldRemoveInvalidTheme = false;

  try {
    var savedTheme = localStorage.getItem(${SERIALIZED_THEME_STORAGE_KEY});
    if (savedTheme === 'light' || savedTheme === ${SERIALIZED_DEFAULT_THEME}) {
      theme = savedTheme;
      shouldPersist = false;
    } else if (savedTheme !== null) {
      shouldRemoveInvalidTheme = true;
    }
  } catch (error) {}

  var themeColorMeta = document.head.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.append(themeColorMeta);
  }
  themeColorMeta.content = themeColors[theme];

  root.classList.remove('light', 'dark', 'system');
  root.classList.add(theme);
  root.style.colorScheme = theme;

  if (shouldRemoveInvalidTheme) {
    try {
      localStorage.removeItem(${SERIALIZED_THEME_STORAGE_KEY});
    } catch (error) {}
  }

  if (shouldPersist) {
    try {
      localStorage.setItem(${SERIALIZED_THEME_STORAGE_KEY}, ${SERIALIZED_DEFAULT_THEME});
    } catch (error) {}
  }
})();`;
