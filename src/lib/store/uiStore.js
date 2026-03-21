import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { log } from '../utils';

export const useUIStore = create(
  persist(
    (set) => ({
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
        set((state) => ({ stickyHeader: value }));
      },

      setPageLoading: (value) => {
        set({ pageLoading: value });
      },
    }),
    {
      name: 'ui-settings', // Key in localStorage
      getStorage: () => localStorage, // Correct way to use localStorage
      partialize: (state) => ({
        theme: state.theme,
        font: state.font,
      }), // Only persist these fields
    },
  ),
);
