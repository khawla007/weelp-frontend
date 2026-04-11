'use client';

import { create } from 'zustand';

export const useNavigationStore = create((set, get) => ({
  isNavigating: false,
  navigationKey: 0,

  setNavigating: (isNavigating) => {
    const currentKey = get().navigationKey;
    set({
      isNavigating,
      // Only increment key when starting navigation, not when stopping
      navigationKey: isNavigating ? currentKey + 1 : currentKey,
    });
  },

  checkAndClearNavigation: () => {
    if (get().isNavigating) {
      set({ isNavigating: false });
    }
  },
}));

export default useNavigationStore;
