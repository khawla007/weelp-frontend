import { THEME_BOOTSTRAP_SCRIPT } from './themeConfig';

export function ThemeBootstrap() {
  return <script id="weelp-theme-bootstrap" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />;
}
