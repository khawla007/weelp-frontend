'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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

const TravelBuddyMap = ({ markers = [], route = null, fitBounds = false }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [2.3522, 48.8566],
      zoom: 3,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!markers.length) return;

    const bounds = new maplibregl.LngLatBounds();
    markers.forEach(({ label, lat, lng }) => {
      const marker = new maplibregl.Marker({ color: ROUTE_STROKE })
        .setLngLat([lng, lat]);
      if (label) marker.setPopup(new maplibregl.Popup({ offset: 16 }).setText(label));
      marker.addTo(map);
      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    if (fitBounds && !bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 48, duration: 600, maxZoom: 12 });
    }
  }, [markers, fitBounds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyRoute = () => {
      const data = route
        ? { type: 'Feature', geometry: { type: 'LineString', coordinates: route.coordinates } }
        : null;

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

  return <div ref={containerRef} className="w-full h-full" />;
};

export default TravelBuddyMap;
