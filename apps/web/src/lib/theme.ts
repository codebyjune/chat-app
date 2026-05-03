import { computed, ref } from 'vue'

const THEME_KEY = 'themeMode'

export type ThemeMode = 'light' | 'dark'

const currentTheme = ref<ThemeMode>('light')

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.dataset.theme = mode
  document.body.dataset.theme = mode
}

export const getStoredTheme = (): ThemeMode => {
  const storedTheme = localStorage.getItem(THEME_KEY)
  return storedTheme === 'dark' ? 'dark' : 'light'
}

export const setTheme = (mode: ThemeMode) => {
  currentTheme.value = mode
  localStorage.setItem(THEME_KEY, mode)
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
