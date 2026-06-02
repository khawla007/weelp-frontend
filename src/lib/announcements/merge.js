// Normalize announcements + personal notifications into one date-sorted feed.
export function mergeFeed({ announcements = [], personal = [] }) {
  const tagged = [...announcements.map((a) => ({ ...a, source: 'announcement' })), ...personal.map((p) => ({ ...p, source: 'personal' }))];
  return tagged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
