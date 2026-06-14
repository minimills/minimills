import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeCardId: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveCard: (cardId: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeCardId: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveCard: (cardId) => set({ activeCardId: cardId }),
}));
