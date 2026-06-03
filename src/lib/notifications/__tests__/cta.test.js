import { resolveNotificationCta } from '../link';

describe('resolveNotificationCta', () => {
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

  test('custom with no action_url → null (no derived route)', () => {
    expect(resolveNotificationCta({ type: 'custom' })).toBeNull();
    expect(resolveNotificationCta({ type: 'custom', action_url: null })).toBeNull();
  });

  test('null notif → null', () => {
    expect(resolveNotificationCta(null)).toBeNull();
  });
});
