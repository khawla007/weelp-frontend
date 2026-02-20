'use client';

import { create } from 'zustand';

export const useNavigationStore = create((set) => ({
  isNavigating: false,
  setNavigating: (isNavigating) => {
    console.log('[NavigationStore] setNavigating called with:', isNavigating);
    console.log('[NavigationStore] setting isNavigating to:', isNavigating);
    set({ isNavigating });
  },
}));

export default useNavigationStore;
