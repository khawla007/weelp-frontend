import { create } from 'zustand';

// For handling Media
export const useMediaStore = create((set) => ({
  selectedMedia: [],

  addMedia: (media) =>
    set((state) => ({
      selectedMedia: [...state.selectedMedia, ...media],
    })),

  removeMedia: (id) =>
    set((state) => ({
      selectedMedia: state.selectedMedia.filter((img) => img.id !== id),
    })),

  resetMedia: () => set({ selectedMedia: [] }),
}));
