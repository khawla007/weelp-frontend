'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { MapPin } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@/app/styles/buddy-map.css';

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

let cachedWebGLSupport = null;

const subscribeNoop = () => () => {};
const getWebGLServer = () => true;

const detectWebGL = () => {
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;
  if (typeof document === 'undefined') return true;

  try {
    const canvas = document.createElement('canvas');
    cachedWebGLSupport = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    cachedWebGLSupport = false;
  }

  return cachedWebGLSupport;
};

const popupMarkup = (marker) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'min-w-[180px] space-y-2';

  const title = document.createElement('strong');
  title.className = 'block text-sm leading-snug text-foreground';
  title.textContent = marker.title;
  wrapper.appendChild(title);

  const details = document.createElement('span');
  details.className = 'block text-xs text-muted-foreground';
  details.textContent = [marker.rating ? `${marker.rating} rating` : null, marker.price || null].filter(Boolean).join(' · ');
  wrapper.appendChild(details);

  const link = document.createElement('a');
  link.href = marker.href;
  link.className = 'inline-flex text-xs font-semibold text-weelp-sage-text hover:underline';
  link.textContent = 'View details';
  wrapper.appendChild(link);

  return wrapper;
};

const markerElement = (index, title) => {
  const el = document.createElement('button');
  el.type = 'button';
  el.setAttribute('aria-label', `View ${title} on map`);
  el.className =
    'size-8 rounded-full border-2 border-white bg-weelp-sage-deep text-xs font-semibold text-white shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2';
  el.textContent = `${index + 1}`;
  return el;
};

export default function ToursMapView({ cards = [], markers = [], cityName = 'This city' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const webglSupported = useSyncExternalStore(subscribeNoop, detectWebGL, getWebGLServer);
  const [runtimeFailed, setRuntimeFailed] = useState(false);
  const mapFailed = !webglSupported || runtimeFailed;

  useEffect(() => {
    if (!containerRef.current || mapRef.current || mapFailed || !markers.length) return;

    try {
      const firstMarker = markers[0];
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: OSM_STYLE,
        center: firstMarker ? [firstMarker.lng, firstMarker.lat] : [55.2708, 25.2048],
        zoom: markers.length > 1 ? 10 : 11,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      mapRef.current = map;
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- recover from synchronous WebGL/MapLibre init failure
      setRuntimeFailed(true);
    }

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapFailed, markers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapFailed || !markers.length) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    if (!markers.length) return;

    const bounds = new maplibregl.LngLatBounds();

    markers.forEach((marker, index) => {
      const mapMarker = new maplibregl.Marker({ element: markerElement(index, marker.title) }).setLngLat([marker.lng, marker.lat]);
      const popup = new maplibregl.Popup({ offset: 18, closeButton: false, className: 'buddy-popup' }).setDOMContent(popupMarkup(marker));
      mapMarker.setPopup(popup);
      mapMarker.addTo(map);
      markerRefs.current.push(mapMarker);
      bounds.extend([marker.lng, marker.lat]);
    });

    const frameMarkers = () => {
      map.resize();
      if (markers.length === 1) {
        map.easeTo({ center: [markers[0].lng, markers[0].lat], zoom: 11, duration: 500 });
        return;
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 56, maxZoom: 12, duration: 500 });
      }
    };

    if (map.loaded()) {
      frameMarkers();
    } else {
      map.once('load', frameMarkers);
    }
  }, [mapFailed, markers]);

  if (!markers.length) {
    return <div className="rounded-[8px] border border-border bg-muted px-6 py-10 text-center text-sm text-muted-foreground">No map locations are available for these tours yet.</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
      <div className="min-h-[360px] overflow-hidden rounded-[8px] border border-border bg-muted md:min-h-[460px]">
        {mapFailed ? (
          <div ref={containerRef} role="status" className="flex h-full min-h-[360px] items-center justify-center px-6 text-center text-sm text-muted-foreground md:min-h-[460px]">
            Interactive map unavailable right now.
          </div>
        ) : (
          <div ref={containerRef} className="buddy-map h-full min-h-[360px] w-full md:min-h-[460px]" aria-label={`${cityName} tours map`} />
        )}
      </div>

      <div className="flex max-h-[460px] flex-col gap-3 overflow-y-auto rounded-[8px] border border-border bg-background p-3">
        {markers.some((marker) => marker.isApproximate) && (
          <p className="rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">Some pins use city-level tour locations until exact meeting points are available.</p>
        )}

        {cards.map((card, index) => (
          <NavigationLink
            key={card.id || card.href}
            href={card.href}
            className="group flex gap-3 rounded-[7px] border border-border bg-background p-3 transition-colors hover:border-weelp-sage-deep/45 hover:bg-muted/60"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-weelp-sage-deep text-xs font-semibold text-white">{index + 1}</span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-weelp-sage-text">{card.title}</span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {card.rating && <span>{card.rating} rating</span>}
                {card.price && <span>{card.price}</span>}
              </span>
            </span>
            <MapPin className="mt-1 size-4 shrink-0 text-weelp-sage-text" aria-hidden="true" />
          </NavigationLink>
        ))}
      </div>
    </div>
  );
}
