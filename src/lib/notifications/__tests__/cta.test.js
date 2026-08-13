import { resolveNotificationCta } from '../link';

describe('resolveNotificationCta', () => {
  const cancellation = (action_url) => ({
    type: 'custom',
    action_url,
    data: { cancellation_request_id: 12 },
  });

  test.each([
    ['customer', '/dashboard/customer?order=42'],
    ['admin', '/dashboard/admin/orders?order=42'],
    ['super_admin', '/dashboard/admin/orders?order=42'],
  ])('allows the exact cancellation route for the %s role', (role, actionUrl) => {
    expect(resolveNotificationCta(cancellation(actionUrl), role)).toEqual({ href: actionUrl, external: false });
  });

  test.each([
    ['customer', '/dashboard/admin/orders?order=42'],
    ['admin', '/dashboard/customer?order=42'],
    ['customer', '/dashboard/customer?order=42&tab=booking'],
    ['customer', '/dashboard/customer?order=42&order=43'],
    ['customer', '/dashboard/customer?order=4.2'],
    ['customer', '/dashboard/customer?order=0'],
    ['customer', '/dashboard/customer?order=-1'],
    ['customer', '/dashboard/customer?order=42#request'],
    ['customer', '/dashboard/customer/orders?order=42'],
    ['customer', 'https://weelp.com/dashboard/customer?order=42'],
    ['customer', '//weelp.com/dashboard/customer?order=42'],
    ['customer', 'javascript:alert(1)'],
  ])('rejects unsafe or non-allowlisted cancellation URL %s / %s', (role, actionUrl) => {
    expect(resolveNotificationCta(cancellation(actionUrl), role)).toBeNull();
  });

  test.each([0, -1, '12', null])('does not treat cancellation_request_id=%p as a cancellation notification', (requestId) => {
    const notif = { type: 'custom', action_url: '/dashboard/customer/earnings', data: { cancellation_request_id: requestId } };
    expect(resolveNotificationCta(notif, 'customer')).toEqual({ href: '/dashboard/customer/earnings', external: false });
  });

  test('uses a safe internal action_url (NavigationLink, not external)', () => {
    expect(resolveNotificationCta({ type: 'custom', action_url: '/dashboard/customer/earnings' })).toEqual({ href: '/dashboard/customer/earnings', external: false });
  });

  test('uses a safe external action_url as external', () => {
    expect(resolveNotificationCta({ type: 'custom', action_url: 'https://weelp.com/x' })).toEqual({ href: 'https://weelp.com/x', external: true });
  });

  test('rejects unsafe action_url and falls back to derived link', () => {
    expect(resolveNotificationCta({ type: 'new_booking', action_url: 'javascript:alert(1)' })).toEqual({ href: '/dashboard/customer/earnings', external: false });
    expect(resolveNotificationCta({ type: 'new_booking', action_url: '//evil.com' })).toEqual({ href: '/dashboard/customer/earnings', external: false });
  });

  test('rejects normalized protocol-relative paths containing backslashes', () => {
    expect(resolveNotificationCta({ type: 'custom', action_url: '/\\evil.example/x' })).toBeNull();
    expect(resolveNotificationCta({ type: 'new_booking', action_url: '/\\evil.example/x' })).toEqual({ href: '/dashboard/customer/earnings', external: false });
  });

  test('custom with no action_url → null (no derived route)', () => {
    expect(resolveNotificationCta({ type: 'custom' })).toBeNull();
    expect(resolveNotificationCta({ type: 'custom', action_url: null })).toBeNull();
  });

  test('null notif → null', () => {
    expect(resolveNotificationCta(null)).toBeNull();
  });
});
