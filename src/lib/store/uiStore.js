import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Initial state
  theme: 'light',
  font: 'Inter',
  stickyHeader: false, // sticky header global state
  pageLoading: false, // page loading state

  // Actions
  setTheme: (newTheme) => {
    set({ theme: newTheme });
  },

  setFont: (newFont) => {
    set({ font: newFont });
  },

  //toggle actions
  setStickyHeader: (value) => {
    set({ stickyHeader: value });
  },

  setPageLoading: (value) => {
    set({ pageLoading: value });
  },
}));
