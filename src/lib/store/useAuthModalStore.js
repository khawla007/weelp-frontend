'use client';

import { create } from 'zustand';

const useAuthModalStore = create((set) => ({
  isOpen: false,
  redirectTo: null,

  openAuthModal: ({ redirectTo = null } = {}) => set({ isOpen: true, redirectTo }),
  closeAuthModal: () => set({ isOpen: false, redirectTo: null }),
}));

export default useAuthModalStore;
