<script setup lang="ts">
import AppSidebar from '../components/AppSidebar.vue'
import { fetchProfile, getStoredUser, logout, updateProfile, type AuthUser } from '../lib/auth'
import { validateEmail, validateUsername } from '../lib/validation'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentUser = ref<AuthUser | null>(getStoredUser())
const loading = ref(true)
const saving = ref(false)
const form = ref({
  username: currentUser.value?.username ?? '',
  email: currentUser.value?.email ?? '',
})
const formError = ref('')
const successMessage = ref('')

const formattedCreatedAt = computed(() =>
  currentUser.value?.createdAt
    ? new Date(currentUser.value.createdAt).toLocaleString('zh-CN')
    : '--',
)

const syncForm = (user: AuthUser | null) => {
  form.value = {
    username: user?.username ?? '',
    email: user?.email ?? '',
  }
}

const handleLogout = () => {
  logout()
  router.push({ name: 'login' })
}

const handleSaveProfile = async () => {
  formError.value = ''
  successMessage.value = ''

  const usernameError = validateUsername(form.value.username)
  const emailError = validateEmail(form.value.email)

  if (usernameError) {
    formError.value = usernameError
    return
  }

  if (emailError) {
    formError.value = emailError
    return
  }

  saving.value = true

  try {
    const updatedUser = await updateProfile({
      username: form.value.username.trim(),
      email: form.value.email.trim(),
    })
    currentUser.value = updatedUser
    syncForm(updatedUser)
    successMessage.value = '资料已更新'
  } catch (error) {
    formError.value = error instanceof Error ? error.message : '更新资料失败'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    currentUser.value = await fetchProfile()
    syncForm(currentUser.value)
  } catch {
    handleLogout()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="grid h-full overflow-hidden grid-cols-[88px_minmax(0,1fr)]" style="background: var(--bg-page);">
    <AppSidebar :username="currentUser?.username ?? 'U'" @logout="handleLogout" />

    <main class="min-h-0 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8">
      <section class="mx-auto max-w-4xl rounded-[32px] p-6 sm:p-8" style="background: var(--bg-surface); box-shadow: var(--shadow-surface);">
        <div class="flex flex-wrap items-start justify-between gap-4 border-b pb-6" style="border-color: var(--border-color);">
          <div>
            <h1 class="mt-2 text-3xl font-semibold" style="color: var(--text-primary);">设置</h1>
          </div>

          <div class="rounded-3xl px-5 py-4 text-sm" style="background: var(--bg-soft-2); color: var(--text-secondary);">
            <p class="font-medium" style="color: var(--text-primary);">当前状态</p>
            <p class="mt-2">{{ loading ? '正在加载用户信息...' : saving ? '正在保存资料...' : '资料已就绪，可直接编辑' }}</p>
          </div>
        </div>

        <div class="mt-8">
          <section class="rounded-[28px] border p-5 sm:p-6" style="border-color: var(--border-color); background: var(--bg-surface-muted);">
            <h2 class="text-lg font-semibold" style="color: var(--text-primary);">编辑资料</h2>
            <form class="mt-5 space-y-4" @submit.prevent="handleSaveProfile">
              <div class="rounded-2xl px-4 py-4" style="background: var(--bg-surface);">
                <label class="text-xs uppercase tracking-[0.2em]" style="color: var(--text-muted);" for="username">用户名</label>
                <input
                  id="username"
                  v-model="form.username"
                  class="mt-3 w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
                  style="border-color: var(--border-strong); background: var(--bg-surface); color: var(--text-primary);"
                  type="text"
                  placeholder="输入用户名"
                  :disabled="loading || saving"
                >
              </div>

              <div class="rounded-2xl px-4 py-4" style="background: var(--bg-surface);">
                <label class="text-xs uppercase tracking-[0.2em]" style="color: var(--text-muted);" for="email">邮箱</label>
                <input
                  id="email"
                  v-model="form.email"
                  class="mt-3 w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
                  style="border-color: var(--border-strong); background: var(--bg-surface); color: var(--text-primary);"
                  type="email"
                  placeholder="输入邮箱地址"
                  :disabled="loading || saving"
                >
              </div>

              <div class="rounded-2xl px-4 py-4" style="background: var(--bg-surface);">
                <p class="text-xs uppercase tracking-[0.2em]" style="color: var(--text-muted);">注册时间</p>
                <p class="mt-3 text-sm font-medium" style="color: var(--text-primary);">{{ formattedCreatedAt }}</p>
              </div>

              <p v-if="formError" class="text-sm" style="color: var(--danger);">{{ formError }}</p>
              <p v-if="successMessage" class="text-sm" style="color: var(--success);">{{ successMessage }}</p>

              <button
                class="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                style="background: var(--accent);"
                type="submit"
                :disabled="loading || saving"
              >
                {{ saving ? '保存中...' : '保存资料' }}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  </div>
</template>
