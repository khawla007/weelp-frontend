const AUTH_REDIRECT_ORIGIN = 'https://weelp.local';

export function getSafeAuthReturnUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return null;
  }

  try {
    const resolvedUrl = new URL(value, AUTH_REDIRECT_ORIGIN);

    if (resolvedUrl.origin !== AUTH_REDIRECT_ORIGIN) {
      return null;
    }

    return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
  } catch {
    return null;
  }
}
