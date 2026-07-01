import { act, renderHook, waitFor } from '@testing-library/react';

import { clearBlogDraft, getBlogDraftKey, readBlogDraft, useBlogAutosave, writeBlogDraft } from '../useBlogAutosave';

const createMemoryStorage = () => {
  const store = new Map();

  return {
    getItem: jest.fn((key) => store.get(key) ?? null),
    setItem: jest.fn((key, value) => store.set(key, value)),
    removeItem: jest.fn((key) => store.delete(key)),
  };
};

const createMethods = (initialValues = {}) => {
  let watcher;

  return {
    getValues: jest.fn(() => initialValues),
    reset: jest.fn(),
    watch: jest.fn((callback) => {
      watcher = callback;
      return { unsubscribe: jest.fn() };
    }),
    emit: (values) => watcher?.(values),
  };
};

describe('blog autosave draft storage', () => {
  it('writes and reads a newer local draft', () => {
    const storage = createMemoryStorage();
    const key = getBlogDraftKey(42);

    writeBlogDraft({
      key,
      storage,
      values: { name: 'Local draft' },
      now: () => new Date('2026-06-30T10:00:00.000Z'),
    });

    expect(readBlogDraft({ key, storage, serverUpdatedAt: '2026-06-30T09:00:00.000Z' })).toEqual({
      savedAt: '2026-06-30T10:00:00.000Z',
      values: { name: 'Local draft' },
    });
  });

  it('does not persist empty draft values', () => {
    const storage = createMemoryStorage();
    const key = getBlogDraftKey();

    writeBlogDraft({
      key,
      storage,
      values: {
        name: '',
        slug: '',
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        excerpt: '',
        media_gallery: [],
        categories: [],
        tags: [],
      },
    });

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(readBlogDraft({ key, storage })).toBeNull();
  });

  it('removes old blank drafts when reading', () => {
    const storage = createMemoryStorage();
    const key = getBlogDraftKey();

    storage.setItem(
      key,
      JSON.stringify({
        savedAt: '2026-06-30T10:00:00.000Z',
        values: {
          name: '',
          slug: '',
          content: '',
          excerpt: '',
          media_gallery: [],
          categories: [],
          tags: [],
        },
      }),
    );

    expect(readBlogDraft({ key, storage })).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith(key);
  });

  it('ignores older drafts and removes malformed drafts', () => {
    const storage = createMemoryStorage();
    const key = getBlogDraftKey(42);

    writeBlogDraft({
      key,
      storage,
      values: { name: 'Old draft' },
      now: () => new Date('2026-06-30T08:00:00.000Z'),
    });

    expect(readBlogDraft({ key, storage, serverUpdatedAt: '2026-06-30T09:00:00.000Z' })).toBeNull();

    storage.setItem(key, '{broken json');

    expect(readBlogDraft({ key, storage })).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith(key);
  });

  it('clears a draft key', () => {
    const storage = createMemoryStorage();
    const key = getBlogDraftKey();

    writeBlogDraft({ key, storage, values: { name: 'Draft' } });
    clearBlogDraft({ key, storage });

    expect(storage.getItem(key)).toBeNull();
  });
});

describe('useBlogAutosave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces form changes into localStorage without showing a restore prompt for the current session save', () => {
    const methods = createMethods({ name: 'Initial' });

    const { result } = renderHook(() =>
      useBlogAutosave({
        methods,
        blogId: null,
        debounceMs: 20,
        now: () => new Date('2026-06-30T10:00:00.000Z'),
      }),
    );

    act(() => {
      methods.emit({ name: 'Autosaved draft' });
      jest.advanceTimersByTime(20);
    });

    const key = getBlogDraftKey();
    expect(JSON.parse(localStorage.getItem(key))).toEqual({
      savedAt: '2026-06-30T10:00:00.000Z',
      values: { name: 'Autosaved draft' },
    });

    expect(result.current.hasDraft).toBe(false);
  });

  it('restores a draft found on load', async () => {
    const key = getBlogDraftKey();
    const methods = createMethods({ name: 'Initial' });

    localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: '2026-06-30T10:00:00.000Z',
        values: { name: 'Loaded draft' },
      }),
    );

    const { result } = renderHook(() =>
      useBlogAutosave({
        methods,
        blogId: null,
        debounceMs: 20,
      }),
    );

    await waitFor(() => {
      expect(result.current.hasDraft).toBe(true);
    });

    act(() => {
      result.current.restoreDraft();
    });

    expect(methods.reset).toHaveBeenCalledWith({ name: 'Loaded draft' }, { keepDefaultValues: false });
  });
});
