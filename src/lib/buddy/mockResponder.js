import { ITINERARIES } from './itineraries';

const FALLBACK_REPLY = "I don't have a canned trip for that yet — try Paris, Tokyo, Rome, NYC, Bali, Dubai, Iceland, Barcelona, Bangkok, or Cape Town.";

const THINKING_MS = 600;

function scoreItinerary(lower, itinerary) {
  return itinerary.keywords.reduce((score, kw) => (lower.includes(kw) ? score + 1 : score), 0);
}

function pickItinerary(text) {
  const lower = text.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const itinerary of ITINERARIES) {
    const score = scoreItinerary(lower, itinerary);
    if (score > bestScore) {
      best = itinerary;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

export async function mockBuddyRespond(text) {
  await new Promise((resolve) => setTimeout(resolve, THINKING_MS));

  const match = pickItinerary(text);

  if (match) {
    return {
      reply: match.reply,
      intent: 'show_route',
      markers: match.markers,
      route: match.route,
      fit_bounds: true,
    };
  }

  return {
    reply: FALLBACK_REPLY,
    intent: 'clarify',
    markers: [],
    route: null,
    fit_bounds: false,
  };
}
