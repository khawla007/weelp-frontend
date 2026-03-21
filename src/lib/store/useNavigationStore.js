'use client';

import { create } from 'zustand';

export const useNavigationStore = create((set, get) => ({
  isNavigating: false,

  setNavigating: (isNavigating) => {
    set({ isNavigating });
  },

  checkAndClearNavigation: () => {
    const state = get();
    if (state.isNavigating) {
      set({ isNavigating: false });
    }
  },
}));

export default useNavigationStore;
