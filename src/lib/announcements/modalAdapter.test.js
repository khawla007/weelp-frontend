import { opensModal, announcementToModalNotif } from './modalAdapter';

describe('opensModal', () => {
  test('true for popup tier', () => {
    expect(opensModal({ display_style: 'popup' })).toBe(true);
  });
  test('true for coupon-bearing inline', () => {
    expect(opensModal({ display_style: 'inline', coupon_code: 'X' })).toBe(true);
  });
  test('false for plain inline', () => {
    expect(opensModal({ display_style: 'inline' })).toBe(false);
  });
});

describe('announcementToModalNotif', () => {
  test('maps link, image_url, coupon_code into modal shape', () => {
    const out = announcementToModalNotif({
      title: 'T',
      message: 'M',
      created_at: '2026-06-04T00:00:00Z',
      link: '/x',
      image_url: '/img.jpg',
      coupon_code: 'WELCOME20',
    });
    expect(out).toEqual({
      title: 'T',
      message: 'M',
      created_at: '2026-06-04T00:00:00Z',
      action_url: '/x',
      data: { images: ['/img.jpg'], coupon_code: 'WELCOME20' },
    });
  });
  test('omits image/coupon and nulls data when absent', () => {
    const out = announcementToModalNotif({ title: 'T', message: 'M', created_at: 'z' });
    expect(out.action_url).toBeNull();
    expect(out.data).toBeNull();
  });
});
