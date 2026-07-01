import { useCallback, useEffect, useMemo, useState } from 'react';
import { hasEditorContent } from '../../shared/richTextContent';

const draftPrefix = 'weelp:blog-editor-draft';

const getStorage = (storage) => {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const toTime = (value) => {
  const time = Date.parse(value || '');
  return Number.isFinite(time) ? time : 0;
};

export const getBlogDraftKey = (blogId) => `${draftPrefix}:${blogId || 'new'}`;

const hasItems = (items = []) => Array.isArray(items) && items.length > 0;

export const hasBlogDraftContent = (values = {}) =>
  Boolean(
    values.name?.trim() || values.slug?.trim() || hasEditorContent(values.content) || values.excerpt?.trim() || hasItems(values.media_gallery) || hasItems(values.categories) || hasItems(values.tags),
  );

export const clearBlogDraft = ({ key, storage }) => {
  const targetStorage = getStorage(storage);
  if (!targetStorage || !key) return;
  targetStorage.removeItem(key);
};

export const writeBlogDraft = ({ key, values, storage, now = () => new Date() }) => {
  const targetStorage = getStorage(storage);
  if (!targetStorage || !key) return;
  if (!hasBlogDraftContent(values)) return;

  targetStorage.setItem(
    key,
    JSON.stringify({
      savedAt: now().toISOString(),
      values,
    }),
  );
};

export const readBlogDraft = ({ key, storage, serverUpdatedAt } = {}) => {
  const targetStorage = getStorage(storage);
  if (!targetStorage || !key) return null;

  const raw = targetStorage.getItem(key);
  if (!raw) return null;

  try {
    const draft = JSON.parse(raw);

    if (!draft?.savedAt || !draft?.values || typeof draft.values !== 'object') {
      targetStorage.removeItem(key);
      return null;
    }

    if (!hasBlogDraftContent(draft.values)) {
      targetStorage.removeItem(key);
      return null;
    }

    if (serverUpdatedAt && toTime(draft.savedAt) <= toTime(serverUpdatedAt)) {
      return null;
    }

    return draft;
  } catch {
    targetStorage.removeItem(key);
    return null;
  }
};

export const useBlogAutosave = ({ methods, blogId, serverUpdatedAt, enabled = true, debounceMs = 800, now } = {}) => {
  const key = useMemo(() => getBlogDraftKey(blogId), [blogId]);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setDraft(readBlogDraft({ key, serverUpdatedAt }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, key, serverUpdatedAt]);

  useEffect(() => {
    if (!enabled || !methods?.watch) return;

    let timer;
    const subscription = methods.watch((values) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        writeBlogDraft({ key, values, now });
      }, debounceMs);
    });

    return () => {
      clearTimeout(timer);
      subscription?.unsubscribe?.();
    };
  }, [debounceMs, enabled, key, methods, now, serverUpdatedAt]);

  const restoreDraft = useCallback(() => {
    if (!draft?.values) return;
    methods?.reset?.(draft.values, { keepDefaultValues: false });
    setDraft(null);
  }, [draft, methods]);

  const discardDraft = useCallback(() => {
    clearBlogDraft({ key });
    setDraft(null);
  }, [key]);

  const clearDraft = useCallback(() => {
    clearBlogDraft({ key });
    setDraft(null);
  }, [key]);

  return {
    clearDraft,
    discardDraft,
    draft,
    hasDraft: Boolean(draft),
    restoreDraft,
  };
};
