import { create } from 'zustand';

export const hasItineraryEditChanges = ({ originalSchedules, modifiedSchedules }) => JSON.stringify(originalSchedules) !== JSON.stringify(modifiedSchedules);

export const calculateItineraryEditPricing = (schedules, headcount = 1, expectedCurrency = null) => {
  let perPaxTotal = 0;
  let flatTotal = 0;
  let currency = typeof expectedCurrency === 'string' && expectedCurrency.trim() ? expectedCurrency.trim().toUpperCase() : null;
  let pricedRows = 0;

  const addCurrency = (nextCurrency) => {
    if (typeof nextCurrency !== 'string' || !nextCurrency.trim()) return false;
    const normalizedCurrency = nextCurrency.trim().toUpperCase();
    if (currency && currency !== normalizedCurrency) return false;
    currency = normalizedCurrency;
    return true;
  };

  for (const schedule of schedules || []) {
    for (const activity of schedule.activities || []) {
      const pricing = activity.pricing;
      const unitPrice = Number(pricing?.unit_price);
      if (pricing?.unit_price == null || !Number.isFinite(unitPrice) || !addCurrency(pricing?.currency)) return null;
      perPaxTotal += unitPrice;
      pricedRows += 1;
    }

    for (const transfer of schedule.transfers || []) {
      const pricing = transfer.pricing;
      const unitPrice = Number(pricing?.unit_price);
      if (pricing?.unit_price == null || !Number.isFinite(unitPrice) || !addCurrency(pricing?.currency)) return null;

      if (pricing?.price_type === 'per_person') perPaxTotal += unitPrice;
      else flatTotal += unitPrice;

      flatTotal += (Number(transfer.bag_count) || 0) * (Number(pricing?.luggage_per_bag) || 0);
      flatTotal += (Number(transfer.waiting_minutes) || 0) * (Number(pricing?.waiting_per_minute) || 0);
      pricedRows += 1;
    }
  }

  if (pricedRows === 0) return null;

  const guests = Math.max(1, Number(headcount) || 1);
  return {
    perPaxTotal: Math.round(perPaxTotal * 100) / 100,
    flatTotal: Math.round(flatTotal * 100) / 100,
    total: Math.round((perPaxTotal * guests + flatTotal) * 100) / 100,
    currency,
  };
};

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

  updateDayTitle: (dayIndex, title) =>
    set((state) => {
      const schedules = JSON.parse(JSON.stringify(state.modifiedSchedules));
      schedules[dayIndex].title = title;
      return { modifiedSchedules: schedules };
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
