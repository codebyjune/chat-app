import { computed, ref } from 'vue'

const THEME_KEY = 'themeMode'

export type ThemeMode = 'light' | 'dark'

const currentTheme = ref<ThemeMode>('light')

const canUseBrowserStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

const canUseDocument = () => typeof document !== 'undefined'

const applyTheme = (mode: ThemeMode) => {
  if (!canUseDocument()) {
    return
  }

  document.documentElement.dataset.theme = mode
  document.body.dataset.theme = mode
}

export const getStoredTheme = (): ThemeMode => {
  if (!canUseBrowserStorage()) {
    return 'light'
  }

  const storedTheme = localStorage.getItem(THEME_KEY)
  return storedTheme === 'dark' ? 'dark' : 'light'
}

export const setTheme = (mode: ThemeMode) => {
  currentTheme.value = mode

  if (canUseBrowserStorage()) {
    localStorage.setItem(THEME_KEY, mode)
  }

  applyTheme(mode)
}

export const initializeTheme = () => {
  currentTheme.value = getStoredTheme()
  applyTheme(currentTheme.value)
}

export const useTheme = () => ({
  theme: computed(() => currentTheme.value),
  isDarkMode: computed(() => currentTheme.value === 'dark'),
  setTheme,
})
