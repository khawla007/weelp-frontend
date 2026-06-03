import { notificationLink } from '../link';

describe('notificationLink', () => {
  test('application_* → application-status', () => {
    expect(notificationLink('application_approved', null)).toBe('/dashboard/customer/application-status');
    expect(notificationLink('application_rejected', {})).toBe('/dashboard/customer/application-status');
  });

  test('itinerary_* with itinerary_id → my-itineraries/{id}', () => {
    expect(notificationLink('itinerary_approved', { itinerary_id: 42 })).toBe('/dashboard/customer/my-itineraries/42');
    expect(notificationLink('itinerary_edit_rejected', { itinerary_id: 7 })).toBe('/dashboard/customer/my-itineraries/7');
  });

  test('itinerary_* without itinerary_id → null', () => {
    expect(notificationLink('itinerary_approved', null)).toBeNull();
    expect(notificationLink('itinerary_approved', {})).toBeNull();
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
