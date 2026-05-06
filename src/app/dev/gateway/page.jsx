'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

import { useGeocode } from '@/hooks/useGeocode';

const DEBOUNCE_MS = 300;

// Phase 5 verification stub. Lives at /dev/gateway and exists to prove three
// things end to end: (1) the gateway service module reaches the Phase 3
// adapters, (2) the NextAuth bearer flips an anonymous request into the user
// rate-limit tier, (3) repeat queries hit the gateway's Redis cache. The
// existing homepage FilterBar runs its own slug-based search against Laravel,
// so wiring geocoded results into it would have meant rewriting that flow.
// Keep this page; remove it only when a real geocoded input replaces it.
export default function GatewayDevPage() {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [picked, setPicked] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer.current);
  }, [query]);

  const { data, error, isLoading, isValidating } = useGeocode(debouncedQuery);

  const tier = session?.access_token ? 'authenticated (600/min)' : 'anonymous (60/min)';

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Gateway dev surface</h1>
        <p className="text-sm text-gray-500">Phase 5 verification. Type a place name; the gateway answers via Mapbox / Nominatim.</p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
          <dt className="text-gray-500">Session</dt>
          <dd>{status === 'loading' ? 'loading…' : (session?.user?.email ?? 'logged out')}</dd>
          <dt className="text-gray-500">Tier</dt>
          <dd>{tier}</dd>
          <dt className="text-gray-500">Bearer</dt>
          <dd className="font-mono text-xs">{session?.access_token ? `${session.access_token.slice(0, 16)}…` : '—'}</dd>
        </dl>
      </section>

      <section className="space-y-3">
        <label htmlFor="geocode-input" className="block text-sm font-medium text-gray-700">
          Geocode query
        </label>
        <input
          id="geocode-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="paris, dubai, marseille…"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#558e7b] focus:outline-none"
          autoComplete="off"
        />
        <p className="text-xs text-gray-400">{isLoading || isValidating ? 'querying gateway…' : data ? `${data.length} result${data.length === 1 ? '' : 's'}` : 'awaiting input'}</p>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <strong>Gateway error</strong> ({error.status ?? '???'}): {error.message}
        </div>
      )}

      {Array.isArray(data) && data.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {data.map((place) => (
            <li key={`${place.provider}:${place.id}`}>
              <button
                type="button"
                onClick={() => {
                  setPicked(place);
                  setQuery(place.name);
                }}
                className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left text-sm hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{place.name}</span>
                <span className="text-xs text-gray-500">
                  {place.country_code ?? '—'} · {place.lat?.toFixed(4)}, {place.lng?.toFixed(4)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {picked && <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">{JSON.stringify(picked, null, 2)}</pre>}
    </main>
  );
}
