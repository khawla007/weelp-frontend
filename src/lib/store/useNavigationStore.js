'use client';

import { create } from 'zustand';

export const useNavigationStore = create((set, get) => ({
  isNavigating: false,
  navigationKey: 0,

  setNavigating: (isNavigating) => {
    set((state) => ({
      isNavigating,
      navigationKey: isNavigating ? state.navigationKey + 1 : state.navigationKey,
    }));
  },

  checkAndClearNavigation: () => {
    if (get().isNavigating) {
      set({ isNavigating: false });
    }
  },
}));

export default useNavigationStore;
