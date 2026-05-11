const OFFLINE_REPLY = {
  reply: 'Buddy is offline — please try again in a moment.',
  intent: 'clarify',
  markers: [],
  route: null,
  fit_bounds: false,
};

export async function realBuddyRespond(text, history = []) {
  try {
    const response = await fetch('/api/buddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, history }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      if (data && typeof data.reply === 'string') return data;
      return OFFLINE_REPLY;
    }

    return await response.json();
  } catch {
    return OFFLINE_REPLY;
  }
}
