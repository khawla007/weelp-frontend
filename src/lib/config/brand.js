/**
 * Brand configuration for Weelp
 * Centralized source for logo and other brand assets
 */

export const BRAND_CONFIG = {
  logoPath: process.env.NEXT_PUBLIC_WEELP_LOGO_PATH || 'logos/weelp-logo-icon.png',
  minioUrl: process.env.NEXT_PUBLIC_MINIO_URL || 'http://192.168.29.153:9000/weelp-media',
};

/**
 * Get the full URL for the Weelp logo
 * @returns {string} Full logo URL
 */
export function getLogoUrl() {
  return `${BRAND_CONFIG.minioUrl}/${BRAND_CONFIG.logoPath}`;
}
