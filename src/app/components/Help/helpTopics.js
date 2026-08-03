export const HELP_TOPICS = Object.freeze(
  [
    { value: 'dates_availability', label: 'Dates & availability' },
    { value: 'pickup_location', label: 'Pickup & location' },
    { value: 'changes_cancellation', label: 'Changes & cancellation' },
    { value: 'before_booking', label: 'Before you book' },
    { value: 'other', label: 'Something else' },
  ].map((topic) => Object.freeze(topic)),
);
