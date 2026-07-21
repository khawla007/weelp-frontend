import { render, screen } from '@testing-library/react';

import ToursMapView from '../ToursMapView';

const mockMapState = {
  throwOnMap: true,
  markerElements: [],
};

jest.mock('maplibre-gl', () => ({
  __esModule: true,
  default: {
    Map: jest.fn(() => {
      if (mockMapState.throwOnMap) {
        throw new Error('map init failed');
      }
      return {
        addControl: jest.fn(),
        remove: jest.fn(),
        resize: jest.fn(),
        loaded: jest.fn(() => true),
        once: jest.fn(),
        easeTo: jest.fn(),
        fitBounds: jest.fn(),
      };
    }),
    NavigationControl: jest.fn(),
    Marker: jest.fn(({ element }) => {
      mockMapState.markerElements.push(element);
      return {
        setLngLat: jest.fn().mockReturnThis(),
        setPopup: jest.fn().mockReturnThis(),
        addTo: jest.fn().mockReturnThis(),
        remove: jest.fn(),
      };
    }),
    Popup: jest.fn(() => ({
      setDOMContent: jest.fn().mockReturnThis(),
    })),
    LngLatBounds: jest.fn(() => ({
      extend: jest.fn(),
      isEmpty: jest.fn(() => false),
    })),
  },
}));

jest.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

const cards = [
  {
    id: 1,
    title: 'Dubai two-day itinerary',
    href: '/cities/dubai/itineraries/dubai-two-day-itinerary',
    price: '$100',
    rating: '4.8',
  },
];

const markers = [
  {
    id: 1,
    title: 'Dubai two-day itinerary',
    href: '/cities/dubai/itineraries/dubai-two-day-itinerary',
    price: '$100',
    rating: '4.8',
    lat: 25.2048,
    lng: 55.2708,
  },
];

describe('ToursMapView', () => {
  beforeEach(() => {
    mockMapState.throwOnMap = true;
    mockMapState.markerElements = [];
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: jest.fn(() => ({})),
    });
  });

  it('shows a map failure message while keeping the compact tour list usable', () => {
    render(<ToursMapView cards={cards} markers={markers} cityName="Dubai" />);

    expect(screen.getByText('Interactive map unavailable right now.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dubai two-day itinerary/i })).toHaveAttribute('href', cards[0].href);
  });

  it('labels map marker buttons with the tour title', () => {
    mockMapState.throwOnMap = false;

    render(<ToursMapView cards={cards} markers={markers} cityName="Dubai" />);

    expect(mockMapState.markerElements[0]).toHaveAttribute('aria-label', 'View Dubai two-day itinerary on map');
  });
});
