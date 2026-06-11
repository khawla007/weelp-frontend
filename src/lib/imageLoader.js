export default function mediaImageLoader({ src, width, quality }) {
  if (typeof src !== 'string' || !src.includes('/api/media/')) {
    return src;
  }
  const q = quality ?? 75;
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}w=${width}&q=${q}`;
}
