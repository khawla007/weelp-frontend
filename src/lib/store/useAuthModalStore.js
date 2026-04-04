'use client';

import { create } from 'zustand';

const useAuthModalStore = create((set) => ({
  isOpen: false,
  redirectTo: null,
  referrer: null,
  onSuccess: null,

  openAuthModal: ({ redirectTo = null, referrer = null, onSuccess = null } = {}) => set({ isOpen: true, redirectTo, referrer, onSuccess }),
  closeAuthModal: () => set({ isOpen: false, redirectTo: null, referrer: null, onSuccess: null }),
}));

export default useAuthModalStore;
