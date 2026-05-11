'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

let cachedWebGLSupport = null;
const detectWebGL = () => {
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;
  if (typeof window === 'undefined' || typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    cachedWebGLSupport = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    cachedWebGLSupport = false;
  }
  return cachedWebGLSupport;
};

const subscribeNoop = () => () => {};
const getWebGLServer = () => true;

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

const ROUTE_SOURCE_ID = 'travel-buddy-route';
const ROUTE_LAYER_ID = 'travel-buddy-route-line';
const ROUTE_STROKE = '#588f7a';

const PREVIEW_PINS = [
  { label: 'Paris', lat: 48.8566, lng: 2.3522 },
  { label: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { label: 'New York', lat: 40.7128, lng: -74.006 },
];

const EASE_OUT = (t) => 1 - Math.pow(1 - t, 2);

const detectReducedMotion = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const detectHover = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover)').matches;

const buildPopup = (label) => {
  const popup = new maplibregl.Popup({ offset: 16, closeButton: false, className: 'buddy-popup' });
  const node = typeof document !== 'undefined' ? document.createElement('span') : null;
  if (node) {
    node.textContent = label;
    popup.setDOMContent(node);
  } else {
    popup.setText(label);
  }
  return popup;
};

const attachPopup = (map, marker, label, supportsHover) => {
  if (!label) return;
  const popup = buildPopup(label);
  marker.setPopup(popup);

  if (supportsHover) {
    const el = marker.getElement();
    const open = () => popup.addTo(map);
    const close = () => popup.remove();
    el.addEventListener('mouseenter', open);
    el.addEventListener('mouseleave', close);
  }
};

const buildPreviewMarkerElement = () => {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'width:18px;height:18px;border-radius:9999px;background:#588f7a;opacity:0.45;border:2px solid #ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.18);cursor:pointer;';
  return el;
};

const TravelBuddyMap = ({ markers = [], route = null, fitBounds = false, showPreview = false }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const previewMarkersRef = useRef([]);
  const reducedMotionRef = useRef(false);
  const supportsHoverRef = useRef(false);
  const webglSupported = useSyncExternalStore(subscribeNoop, detectWebGL, getWebGLServer);
  const [runtimeFailed, setRuntimeFailed] = useState(false);
  const mapFailed = !webglSupported || runtimeFailed;

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !webglSupported) return;

    reducedMotionRef.current = detectReducedMotion();
    supportsHoverRef.current = detectHover();

    let map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: OSM_STYLE,
        center: [2.3522, 48.8566],
        zoom: 1.4,
      });
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- recover from synchronous WebGL/MapLibre init failure
      setRuntimeFailed(true);
      return;
    }

    const handleError = (e) => {
      const name = e?.error?.name;
      if (name === 'WebGLContextCreationError' || name === 'WebGLContextLostError') {
        setRuntimeFailed(true);
      }
    };
    map.on('error', handleError);
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      previewMarkersRef.current.forEach((m) => m.remove());
      previewMarkersRef.current = [];
      map.off('error', handleError);
      map.remove();
      mapRef.current = null;
    };
  }, [webglSupported]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    previewMarkersRef.current.forEach((m) => m.remove());
    previewMarkersRef.current = [];

    if (!showPreview || markers.length > 0) return;

    PREVIEW_PINS.forEach(({ label, lat, lng }) => {
      const marker = new maplibregl.Marker({ element: buildPreviewMarkerElement() }).setLngLat([lng, lat]);
      const popup = buildPopup(`${label} — Try asking about these`);
      marker.setPopup(popup);
      const el = marker.getElement();
      if (supportsHoverRef.current) {
        el.addEventListener('mouseenter', () => popup.addTo(map));
        el.addEventListener('mouseleave', () => popup.remove());
      }
      marker.addTo(map);
      previewMarkersRef.current.push(marker);
    });
  }, [showPreview, markers.length]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!markers.length) return;

    const reducedMotion = reducedMotionRef.current;
    const supportsHover = supportsHoverRef.current;
    const bounds = new maplibregl.LngLatBounds();

    markers.forEach(({ label, lat, lng }) => {
      const marker = new maplibregl.Marker({ color: ROUTE_STROKE }).setLngLat([lng, lat]);
      attachPopup(map, marker, label, supportsHover);
      marker.addTo(map);
      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    if (!fitBounds) return;

    if (markers.length === 1) {
      const { lat, lng } = markers[0];
      if (reducedMotion) {
        map.jumpTo({ center: [lng, lat], zoom: 11 });
      } else {
        map.flyTo({ center: [lng, lat], zoom: 11, duration: 1000, essential: true });
      }
      return;
    }

    if (bounds.isEmpty()) return;

    if (reducedMotion) {
      map.fitBounds(bounds, { padding: 60, duration: 0, maxZoom: 12 });
    } else {
      map.fitBounds(bounds, { padding: 60, duration: 1000, maxZoom: 12, easing: EASE_OUT, essential: true });
    }
  }, [markers, fitBounds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyRoute = () => {
      const data = route ? { type: 'Feature', geometry: { type: 'LineString', coordinates: route.coordinates } } : null;

      const existing = map.getSource(ROUTE_SOURCE_ID);
      if (!data) {
        if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
        if (existing) map.removeSource(ROUTE_SOURCE_ID);
        return;
      }

      if (existing) {
        existing.setData(data);
        return;
      }

      map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data });
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ROUTE_STROKE, 'line-width': 3 },
      });
    };

    if (map.isStyleLoaded()) {
      applyRoute();
    } else {
      map.once('load', applyRoute);
    }
  }, [route]);

  if (mapFailed) {
    return (
      <div ref={containerRef} role="status" className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-600 text-sm p-6 text-center">
        <span>Interactive map unavailable. Enable hardware acceleration in your browser (chrome://settings/system) to view it.</span>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
};

export default TravelBuddyMap;
