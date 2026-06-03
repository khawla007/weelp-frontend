import { notificationLink } from '../link';

describe('notificationLink', () => {
  test('application_* → application-status', () => {
    expect(notificationLink('application_approved', null)).toBe('/dashboard/customer/application-status');
    expect(notificationLink('application_rejected', {})).toBe('/dashboard/customer/application-status');
  });

  test('itinerary_* → my-itineraries list (no per-id detail route exists)', () => {
    expect(notificationLink('itinerary_approved', { itinerary_id: 42 })).toBe('/dashboard/customer/my-itineraries');
    expect(notificationLink('itinerary_edit_rejected', { itinerary_id: 7 })).toBe('/dashboard/customer/my-itineraries');
    expect(notificationLink('itinerary_approved', null)).toBe('/dashboard/customer/my-itineraries');
    expect(notificationLink('itinerary_removal_approved', {})).toBe('/dashboard/customer/my-itineraries');
  });

  test('new_booking → earnings', () => {
    expect(notificationLink('new_booking', { order_id: 1 })).toBe('/dashboard/customer/earnings');
  });

  test('unknown / missing type → null', () => {
    expect(notificationLink('something_else', {})).toBeNull();
    expect(notificationLink(null, {})).toBeNull();
    expect(notificationLink(undefined, undefined)).toBeNull();
  });
});
