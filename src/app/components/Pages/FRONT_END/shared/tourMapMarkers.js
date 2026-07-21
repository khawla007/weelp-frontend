const KNOWN_CITY_COORDINATES = {
  dubai: { latitude: 25.2048, longitude: 55.2708 },
};

const OFFSET_STEP = 0.018;

const toCoordinateNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const isValidLatitude = (value) => value !== null && value >= -90 && value <= 90;
const isValidLongitude = (value) => value !== null && value >= -180 && value <= 180;

const coordinatePair = (source) => {
  if (!source || typeof source !== 'object') return null;

  const latitude = toCoordinateNumber(source.latitude ?? source.lat ?? source.location_details?.latitude ?? source.locationDetails?.latitude);
  const longitude = toCoordinateNumber(source.longitude ?? source.lng ?? source.location_details?.longitude ?? source.locationDetails?.longitude);

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) return null;

  return { lat: latitude, lng: longitude };
};

const itemCoordinates = (item) => {
  const direct = coordinatePair(item);
  if (direct) return direct;

  const locations = Array.isArray(item?.locations) ? item.locations : [];
  for (const location of locations) {
    const fromLocation = coordinatePair(location);
    if (fromLocation) return fromLocation;

    const fromPlace = coordinatePair(location?.place);
    if (fromPlace) return fromPlace;

    const fromCity = coordinatePair(location?.city);
    if (fromCity) return fromCity;
  }

  return null;
};

const fallbackCoordinates = ({ citySlug, cityCoordinates }) => coordinatePair(cityCoordinates) ?? coordinatePair(KNOWN_CITY_COORDINATES[citySlug]) ?? null;

const offsetCoordinates = ({ lat, lng }, index) => {
  const angle = index * 2.399963229728653;
  const radius = OFFSET_STEP * (1 + Math.floor(index / 6) * 0.75);
  return {
    lat: Number((lat + Math.sin(angle) * radius).toFixed(6)),
    lng: Number((lng + Math.cos(angle) * radius).toFixed(6)),
  };
};

export function buildTourMapMarkers(items = [], cards = [], options = {}) {
  const citySlug = options.citySlug;
  const fallback = fallbackCoordinates(options);

  return items
    .map((item, index) => {
      const card = cards.find((candidate) => candidate.id === item?.id) ?? cards[index];
      if (!card) return null;

      const resolved = itemCoordinates(item);
      const coordinates = resolved ?? (fallback ? offsetCoordinates(fallback, index) : null);
      if (!coordinates) return null;

      return {
        id: card.id ?? item?.id ?? `${citySlug || 'tour'}-${index}`,
        title: card.title,
        href: card.href,
        price: card.price,
        rating: card.rating,
        reviewCount: card.reviewCount,
        lat: coordinates.lat,
        lng: coordinates.lng,
        isApproximate: !resolved,
      };
    })
    .filter(Boolean);
}
