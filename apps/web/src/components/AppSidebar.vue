<script setup lang="ts">
import { MessageSquare, Moon, Settings, Sun } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '../lib/theme'

defineProps<{
  username: string
}>()

const route = useRoute()
const router = useRouter()
const { isDarkMode, setTheme } = useTheme()

const emit = defineEmits<{
  logout: []
}>()

const activeRouteName = computed(() => route.name)

const navigateTo = (name: 'app' | 'settings') => {
  router.push({ name })
}

const toggleTheme = () => {
  setTheme(isDarkMode.value ? 'light' : 'dark')
}
</script>

<template>
  <aside class="flex h-full flex-col items-center justify-between border-r px-4 py-6" style="border-color: var(--border-color); background: var(--bg-surface);">
    <div class="flex flex-col items-center gap-6">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold text-white" style="background: var(--accent);">
        C
      </div>

      <div class="flex flex-col items-center gap-3">
        <button
          class="flex h-12 w-12 items-center justify-center rounded-2xl transition"
          :style="activeRouteName === 'app' ? { background: 'var(--accent)', color: '#ffffff' } : { color: 'var(--text-muted)' }"
          type="button"
          @click="navigateTo('app')"
        >
          <MessageSquare class="h-5 w-5" />
        </button>
        <button
          class="flex h-12 w-12 items-center justify-center rounded-2xl transition"
          style="color: var(--text-muted);"
          type="button"
          :title="isDarkMode ? '切换到日间模式' : '切换到夜间模式'"
          @click="toggleTheme"
        >
          <Moon v-if="!isDarkMode" class="h-5 w-5" />
          <Sun v-else class="h-5 w-5" />
        </button>
        <button
          class="flex h-12 w-12 items-center justify-center rounded-2xl transition"
          :style="activeRouteName === 'settings' ? { background: 'var(--accent)', color: '#ffffff' } : { color: 'var(--text-muted)' }"
          type="button"
          @click="navigateTo('settings')"
        >
          <Settings class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="flex flex-col items-center gap-3">
      <button class="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold" style="background: var(--bg-soft); color: var(--text-primary);">
        {{ username.slice(0, 1).toUpperCase() }}
      </button>
      <button class="text-xs transition" style="color: var(--text-subtle);" type="button" @click="emit('logout')">
        退出
      </button>
    </div>
  </aside>
</template>
