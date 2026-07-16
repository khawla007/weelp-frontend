import { resolveBlogFilters } from '../blogFilters';

describe('resolveBlogFilters', () => {
  it('keeps supported category and tag query strings for the blog list', async () => {
    await expect(resolveBlogFilters(Promise.resolve({ category: 'travel-tips', tag: 'family' }))).resolves.toEqual({
      category: 'travel-tips',
      tag: 'family',
    });
  });

  it('ignores repeated taxonomy query params instead of passing arrays to the client filter', async () => {
    await expect(resolveBlogFilters(Promise.resolve({ category: ['travel-tips'], tag: ['family'] }))).resolves.toEqual({
      category: '',
      tag: '',
    });
  });
});
