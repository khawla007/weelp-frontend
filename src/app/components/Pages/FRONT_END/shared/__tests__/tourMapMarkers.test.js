import { buildTourMapMarkers } from '../tourMapMarkers';

const cardFor = (id, title = `Tour ${id}`) => ({
  id,
  title,
  href: `/cities/dubai/itineraries/tour-${id}`,
  price: '$100',
});

describe('buildTourMapMarkers', () => {
  it('prefers item-level coordinates and parses numeric strings', () => {
    const markers = buildTourMapMarkers([{ id: 1, latitude: '25.1972', longitude: '55.2744' }], [cardFor(1, 'Burj tour')], {
      citySlug: 'dubai',
      cityCoordinates: { latitude: '25.2048', longitude: '55.2708' },
    });

    expect(markers).toEqual([
      expect.objectContaining({
        id: 1,
        title: 'Burj tour',
        lat: 25.1972,
        lng: 55.2744,
        isApproximate: false,
      }),
    ]);
  });

  it('uses location coordinates before city fallback coordinates', () => {
    const markers = buildTourMapMarkers(
      [
        {
          id: 2,
          locations: [{ latitude: '25.118', longitude: '55.200' }],
        },
      ],
      [cardFor(2)],
      { citySlug: 'dubai', cityCoordinates: { latitude: '25.2048', longitude: '55.2708' } },
    );

    expect(markers[0]).toEqual(expect.objectContaining({ lat: 25.118, lng: 55.2, isApproximate: false }));
  });

  it('rejects invalid item coordinates and offsets city fallback markers', () => {
    const markers = buildTourMapMarkers(
      [
        { id: 3, latitude: 'not-a-number', longitude: '55.1' },
        { id: 4, latitude: '999', longitude: '55.1' },
      ],
      [cardFor(3), cardFor(4)],
      { citySlug: 'dubai', cityCoordinates: { latitude: '25.2048', longitude: '55.2708' } },
    );

    expect(markers).toHaveLength(2);
    expect(markers[0]).toEqual(expect.objectContaining({ isApproximate: true }));
    expect(markers[1]).toEqual(expect.objectContaining({ isApproximate: true }));
    expect(markers[0].lat).not.toBe(markers[1].lat);
    expect(markers[0].lng).not.toBe(markers[1].lng);
  });

  it('uses the Dubai fallback when city coordinates are omitted for the Dubai slug', () => {
    const markers = buildTourMapMarkers([{ id: 5 }], [cardFor(5)], { citySlug: 'dubai' });

    expect(markers[0]).toEqual(expect.objectContaining({ isApproximate: true }));
    expect(markers[0].lat).toBeCloseTo(25.2048, 1);
    expect(markers[0].lng).toBeCloseTo(55.2708, 1);
  });

  it('returns no marker when neither item, city, nor known fallback coordinates are available', () => {
    const markers = buildTourMapMarkers([{ id: 6 }], [cardFor(6)], { citySlug: 'unknown-city' });

    expect(markers).toEqual([]);
  });
});
