import { create } from 'zustand';

const useStore = create((set) => ({
  // Theme
  theme: localStorage.getItem('terminal-theme') || 'dark',
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('terminal-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      document.documentElement.classList.toggle('light', next === 'light');
      return { theme: next };
    }),

  // Time range
  timeRange: '1d',
  setTimeRange: (range) => set({ timeRange: range }),

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // TradingView modal
  modalTicker: null,
  openModal: (ticker) => set({ modalTicker: ticker }),
  closeModal: () => set({ modalTicker: null }),
}));

export default useStore;
