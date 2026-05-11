const PLACES = [
  { match: 'paris', label: 'Paris', lat: 48.8566, lng: 2.3522 },
  { match: 'tokyo', label: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { match: 'rome', label: 'Rome', lat: 41.9028, lng: 12.4964 },
];

export async function mockBuddyRespond(text) {
  const lower = text.toLowerCase();
  const hit = PLACES.find((place) => lower.includes(place.match));

  if (hit) {
    return {
      reply: `Heading to ${hit.label}! Marked it on the map.`,
      intent: 'show_place',
      markers: [{ label: hit.label, lat: hit.lat, lng: hit.lng }],
      route: null,
      fit_bounds: true,
    };
  }

  return {
    reply: `Got it — let me think about: ${text}`,
    intent: 'chitchat',
    markers: [],
    route: null,
    fit_bounds: false,
  };
}
