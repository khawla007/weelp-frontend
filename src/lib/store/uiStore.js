import { create } from 'zustand';

export const useUIStore = create((set) => ({
  font: 'Inter',
  stickyHeader: false,
  pageLoading: false,

  setFont: (newFont) => {
    set({ font: newFont });
  },

  setStickyHeader: (value) => {
    set({ stickyHeader: value });
  },

  setPageLoading: (value) => {
    set({ pageLoading: value });
  },
}));
