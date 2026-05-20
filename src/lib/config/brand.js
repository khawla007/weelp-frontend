/**
 * Brand configuration for Weelp
 * Centralized source for logo and other brand assets
 */

export const BRAND_CONFIG = {
  logoPath: '/assets/images/weelp-logo-icon.png',
};

/**
 * Get the full URL for the Weelp logo
 * @returns {string} Full logo URL
 */
export function getLogoUrl() {
  return BRAND_CONFIG.logoPath;
}
