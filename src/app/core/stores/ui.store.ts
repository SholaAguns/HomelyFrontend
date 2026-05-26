import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

type UiState = {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  viewMode: 'grid' | 'list';
};

const initialState: UiState = {
  sidebarOpen: true,
  theme: 'light',
  viewMode: 'grid',
};

export const UiStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    toggleSidebar: () => {
      patchState(store, { sidebarOpen: !store.sidebarOpen() });
    },

    setSidebarOpen: (open: boolean) => {
      patchState(store, { sidebarOpen: open });
    },

    toggleTheme: () => {
      const newTheme = store.theme() === 'light' ? 'dark' : 'light';
      patchState(store, { theme: newTheme });
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      localStorage.setItem('theme', newTheme);
    },

    setTheme: (theme: 'light' | 'dark') => {
      patchState(store, { theme });
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    },

    setViewMode: (viewMode: 'grid' | 'list') => {
      patchState(store, { viewMode });
    },

    initializeFromStorage: () => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const savedViewMode = localStorage.getItem('viewMode') as 'grid' | 'list' | null;

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolvedTheme: 'light' | 'dark' = savedTheme ?? (prefersDark ? 'dark' : 'light');

      patchState(store, { theme: resolvedTheme });
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');

      if (savedViewMode) {
        patchState(store, { viewMode: savedViewMode });
      }
    },
  }))
);
