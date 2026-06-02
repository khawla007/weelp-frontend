import { mergeFeed } from '../merge';

const ann = [{ id: 10, type: 'offer', title: 'Deal', message: 'm', created_at: '2026-06-02T10:00:00Z' }];
const personal = [
  { id: 1, title: 'Booking', message: 'm', read_at: null, created_at: '2026-06-02T12:00:00Z' },
  { id: 2, title: 'Old', message: 'm', read_at: '2026-06-01T00:00:00Z', created_at: '2026-06-01T09:00:00Z' },
];

describe('merge feed', () => {
  test('mergeFeed tags sources and sorts by created_at desc', () => {
    const feed = mergeFeed({ announcements: ann, personal });
    expect(feed.map((f) => `${f.source}:${f.id}`)).toEqual(['personal:1', 'announcement:10', 'personal:2']);
  });
});
