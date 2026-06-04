const DISMISSED_KEY = 'dismissedAnnouncements';
const READ_KEY = 'readAnnouncements';

function safeRead(key) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(key, ids) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // localStorage unavailable (private mode) — ignore
  }
}

export function getDismissedIds() {
  return safeRead(DISMISSED_KEY);
}

// Adds `ids` to the dismissed set, pruned to only `liveIds` to bound growth.
export function dismissIds(ids, liveIds) {
  const live = new Set(liveIds);
  const next = new Set([...safeRead(DISMISSED_KEY), ...ids].filter((id) => live.has(id)));
  safeWrite(DISMISSED_KEY, [...next]);
}

// Per-announcement read state — independent of dismissed (which zeroes the badge).
// Drives the envelope icon: closed while NOT in this set, open once added.
export function getReadAnnouncementIds() {
  return safeRead(READ_KEY);
}

export function markAnnouncementRead(id, liveIds) {
  const live = new Set(liveIds);
  const next = new Set([...safeRead(READ_KEY), id].filter((x) => live.has(x)));
  safeWrite(READ_KEY, [...next]);
}

export function markAnnouncementUnread(id) {
  const next = safeRead(READ_KEY).filter((x) => x !== id);
  safeWrite(READ_KEY, next);
}
