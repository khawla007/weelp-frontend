import { create } from 'zustand';

export const useItineraryEditStore = create((set, get) => ({
  // State
  originalSchedules: [],
  modifiedSchedules: [],
  itineraryId: null,
  itinerarySlug: null,
  cityIds: [],

  // Initialize with itinerary data
  initializeEdit: (itinerary) =>
    set({
      originalSchedules: JSON.parse(JSON.stringify(itinerary.schedules)),
      modifiedSchedules: JSON.parse(JSON.stringify(itinerary.schedules)),
      itineraryId: itinerary.id,
      itinerarySlug: itinerary.slug,
      cityIds: itinerary.locations?.map((l) => l.city_id) || [],
    }),

  // Day operations
  addDay: () =>
    set((state) => {
      const maxDay = state.modifiedSchedules.reduce((max, s) => Math.max(max, s.day), 0);
      return {
        modifiedSchedules: [...state.modifiedSchedules, { day: maxDay + 1, title: '', activities: [], transfers: [] }],
      };
    }),

  removeDay: (dayIndex) =>
    set((state) => {
      const updated = state.modifiedSchedules.filter((_, i) => i !== dayIndex);
      return {
        modifiedSchedules: updated.map((s, i) => ({ ...s, day: i + 1 })),
      };
    }),

  // Activity operations
  changeActivity: (dayIndex, activityIndex, newActivity) =>
    set((state) => {
      const schedules = JSON.parse(JSON.stringify(state.modifiedSchedules));
      schedules[dayIndex].activities[activityIndex] = {
        ...schedules[dayIndex].activities[activityIndex],
        ...newActivity,
      };
      return { modifiedSchedules: schedules };
    }),

  addActivity: (dayIndex, activity) =>
    set((state) => {
      const schedules = JSON.parse(JSON.stringify(state.modifiedSchedules));
      schedules[dayIndex].activities.push(activity);
      return { modifiedSchedules: schedules };
    }),

  removeActivity: (dayIndex, activityIndex) =>
    set((state) => {
      const schedules = JSON.parse(JSON.stringify(state.modifiedSchedules));
      schedules[dayIndex].activities.splice(activityIndex, 1);
      return { modifiedSchedules: schedules };
    }),

  // Transfer operations
  changeTransfer: (dayIndex, transferIndex, newTransfer) =>
    set((state) => {
      const schedules = JSON.parse(JSON.stringify(state.modifiedSchedules));
      schedules[dayIndex].transfers[transferIndex] = {
        ...schedules[dayIndex].transfers[transferIndex],
        ...newTransfer,
      };
      return { modifiedSchedules: schedules };
    }),

  addTransfer: (dayIndex, transfer) =>
    set((state) => {
      const schedules = JSON.parse(JSON.stringify(state.modifiedSchedules));
      schedules[dayIndex].transfers.push(transfer);
      return { modifiedSchedules: schedules };
    }),

  removeTransfer: (dayIndex, transferIndex) =>
    set((state) => {
      const schedules = JSON.parse(JSON.stringify(state.modifiedSchedules));
      schedules[dayIndex].transfers.splice(transferIndex, 1);
      return { modifiedSchedules: schedules };
    }),

  // Reset
  resetChanges: () =>
    set((state) => ({
      modifiedSchedules: JSON.parse(JSON.stringify(state.originalSchedules)),
    })),

  // Clear store
  clearEdit: () =>
    set({
      originalSchedules: [],
      modifiedSchedules: [],
      itineraryId: null,
      itinerarySlug: null,
      cityIds: [],
    }),
}));
