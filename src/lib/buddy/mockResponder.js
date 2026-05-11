export async function mockBuddyRespond(text) {
  return {
    reply: `Got it — let me think about: ${text}`,
    intent: 'chitchat',
    markers: [],
    route: null,
    fit_bounds: false,
  };
}
