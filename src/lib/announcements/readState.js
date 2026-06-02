const KEY = 'dismissedAnnouncements';

function safeRead() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(ids) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable (private mode) — ignore
  }
}

export function getDismissedIds() {
  return safeRead();
}

// Adds `ids` to the dismissed set, pruned to only `liveIds` to bound growth.
export function dismissIds(ids, liveIds) {
  const live = new Set(liveIds);
  const next = new Set([...safeRead(), ...ids].filter((id) => live.has(id)));
  safeWrite([...next]);
}
