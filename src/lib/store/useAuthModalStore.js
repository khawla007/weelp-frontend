'use client';

import { create } from 'zustand';

const useAuthModalStore = create((set) => ({
  isOpen: false,
  redirectTo: null,
  referrer: null, // Store the page user came from

  openAuthModal: ({ redirectTo = null, referrer = null } = {}) => set({ isOpen: true, redirectTo, referrer }),
  closeAuthModal: () => set({ isOpen: false, redirectTo: null, referrer: null }),
}));

export default useAuthModalStore;
