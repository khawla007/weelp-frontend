// Streams a public media object from the Laravel /api/media/{path} proxy.
// Exists so avatar URLs like `/api/media/avatars/2.webp` resolve against this
// Next.js origin instead of MinIO directly — works on LAN clients where the
// backend's MinIO endpoint host isn't reachable.

export async function GET(request, { params }) {
  const { path } = await params;
  const objectPath = Array.isArray(path) ? path.join('/') : path;

  const upstream = await fetch(`${process.env.API_BASE_URL}api/media/${objectPath}`, {
    cache: 'no-store',
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const cacheControl = upstream.headers.get('cache-control') ?? 'public, max-age=3600';
  headers.set('cache-control', cacheControl);

  return new Response(upstream.body, { status: 200, headers });
}
