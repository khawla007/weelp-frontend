import { Baby, Clock, Languages, Mountain, Tag, Users } from 'lucide-react';

import { getAttributeIcon } from '../attributeIcons';

describe('getAttributeIcon', () => {
  it('returns Clock for the duration slug', () => {
    expect(getAttributeIcon('duration')).toBe(Clock);
  });

  it('returns Users for the group-size slug', () => {
    expect(getAttributeIcon('group-size')).toBe(Users);
  });

  it('returns Baby for the age-restriction slug', () => {
    expect(getAttributeIcon('age-restriction')).toBe(Baby);
  });

  it('returns Languages for the language slug', () => {
    expect(getAttributeIcon('language')).toBe(Languages);
  });

  it('returns Mountain for the difficulty-level slug', () => {
    expect(getAttributeIcon('difficulty-level')).toBe(Mountain);
  });

  it('returns Mountain for the activity-level slug', () => {
    expect(getAttributeIcon('activity-level')).toBe(Mountain);
  });

  it('falls back to Tag for unknown slugs', () => {
    expect(getAttributeIcon('some-brand-new-attribute')).toBe(Tag);
  });

  it('falls back to Tag when the slug is null or undefined', () => {
    expect(getAttributeIcon(null)).toBe(Tag);
    expect(getAttributeIcon(undefined)).toBe(Tag);
  });
});
