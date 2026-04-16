/**
 * Reshape a draft itinerary API response into the flat shape expected by
 * CreatorItineraryFormShell's react-hook-form state.
 *
 * Form shape mirrors the admin itinerary form (PersonalInfoTab + ScheduleTab):
 *   {
 *     name, slug, description,
 *     featured_itinerary, private_itinerary,
 *     locations: [cityId, ...],
 *     schedules:  [{ day, title }],
 *     activities: [{ day, activity_id, activitydata, start_time, end_time, ... }],
 *     transfers:  [{ day, transfer_id, transferData,  start_time, end_time, ... }],
 *   }
 */
export function reshapeDraftForForm(draft) {
  if (!draft) {
    return {
      name: '',
      slug: '',
      description: '',
      featured_itinerary: false,
      private_itinerary: false,
      locations: [],
      schedules: [],
      activities: [],
      transfers: [],
    };
  }

  const locations = Array.isArray(draft.locations) ? draft.locations.map((loc) => loc.city_id ?? loc.city?.id).filter(Boolean) : [];

  const schedules = [];
  const activities = [];
  const transfers = [];

  if (Array.isArray(draft.schedules)) {
    for (const schedule of draft.schedules) {
      schedules.push({
        day: schedule.day,
        title: schedule.title ?? '',
      });

      if (Array.isArray(schedule.activities)) {
        for (const a of schedule.activities) {
          activities.push({
            day: schedule.day,
            activity_id: a.activity_id,
            activitydata: a.activitydata ?? a.activity ?? { name: a.name },
            start_time: a.start_time ?? '',
            end_time: a.end_time ?? '',
            price: a.price ?? null,
            included: a.included ?? true,
            notes: a.notes ?? '',
          });
        }
      }

      if (Array.isArray(schedule.transfers)) {
        for (const t of schedule.transfers) {
          transfers.push({
            day: schedule.day,
            transfer_id: t.transfer_id,
            transferData: t.transferData ?? t.transfer ?? { name: t.name },
            start_time: t.start_time ?? '',
            end_time: t.end_time ?? '',
            pickup_location: t.pickup_location ?? '',
            dropoff_location: t.dropoff_location ?? '',
            pax: t.pax ?? null,
            price: t.price ?? null,
            included: t.included ?? true,
            notes: t.notes ?? '',
          });
        }
      }
    }
  }

  return {
    name: draft.name ?? '',
    slug: draft.slug ?? '',
    description: draft.description ?? '',
    featured_itinerary: !!draft.featured_itinerary,
    private_itinerary: !!draft.private_itinerary,
    locations,
    schedules,
    activities,
    transfers,
  };
}
