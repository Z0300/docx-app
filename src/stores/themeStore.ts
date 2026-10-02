import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeName = 'app-light' | 'app-dark'

interface ThemeState {
  theme: ThemeName
  toggle: () => void
}

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches

function apply(theme: ThemeName) {
  document.documentElement.setAttribute('data-theme', theme)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: prefersDark() ? 'app-dark' : 'app-light',
      toggle: () => {
        const next: ThemeName = get().theme === 'app-light' ? 'app-dark' : 'app-light'
        apply(next)
        set({ theme: next })
      },
    }),
    {
      name: 'app-theme',
      onRehydrateStorage: () => (state) => {
        if (state) apply(state.theme)
      },
    },
  ),
)
