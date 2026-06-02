import { getDismissedIds, dismissIds } from '../readState';

describe('announcement read-state', () => {
  beforeEach(() => localStorage.clear());

  test('getDismissedIds returns empty array when nothing stored', () => {
    expect(getDismissedIds()).toEqual([]);
  });

  test('dismissIds persists ids and prunes to live ids', () => {
    dismissIds([1, 2], [1, 2, 3]);
    expect(getDismissedIds().sort()).toEqual([1, 2]);

    // id 2 no longer live -> pruned on next dismiss
    dismissIds([3], [1, 3]);
    expect(getDismissedIds().sort()).toEqual([1, 3]);
  });
});
