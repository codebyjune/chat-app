<script setup lang="ts">
defineProps<{
  email: string
  password: string
  loading: boolean
  emailError: string
  passwordError: string
}>()

const emit = defineEmits<{
  submit: []
  updateEmail: [value: string]
  updatePassword: [value: string]
  blurEmail: []
  blurPassword: []
}>()
</script>

<template>
  <div class="w-full max-w-md rounded-[32px] border p-8" style="border-color: var(--border-color); background: var(--bg-surface); box-shadow: var(--shadow-surface);">
    <div class="mb-8 flex items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.3em]" style="color: var(--text-muted);">安全登录</p>
        <h1 class="mt-3 text-3xl font-semibold" style="color: var(--text-primary);">
          欢迎回来
        </h1>
        <p class="mt-3 max-w-sm text-sm leading-6" style="color: var(--text-subtle);">
          登录后继续查看消息、保持同步，并从上次离开的地方继续。
        </p>
      </div>

      <div class="hidden h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold text-white sm:flex" style="background: var(--accent);">
        C
      </div>
    </div>

    <form class="space-y-4" @submit.prevent="emit('submit')">
      <div>
        <label class="mb-2 block text-sm font-medium" style="color: var(--text-secondary);">邮箱</label>
        <input
          :class="[
            'w-full rounded-2xl px-4 py-3 text-sm outline-none transition',
            emailError ? 'ring-1 ring-[#E5484D]' : '',
          ]"
          style="background: var(--bg-soft); color: var(--text-primary);"
          type="email"
          placeholder="请输入邮箱"
          :value="email"
          :disabled="loading"
          @input="emit('updateEmail', ($event.target as HTMLInputElement).value)"
          @blur="emit('blurEmail')"
        >
        <p v-if="emailError" class="mt-2 text-sm" style="color: var(--danger);">
          {{ emailError }}
        </p>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium" style="color: var(--text-secondary);">密码</label>
        <input
          :class="[
            'w-full rounded-2xl px-4 py-3 text-sm outline-none transition',
            passwordError ? 'ring-1 ring-[#E5484D]' : '',
          ]"
          style="background: var(--bg-soft); color: var(--text-primary);"
          type="password"
          placeholder="请输入密码"
          :value="password"
          :disabled="loading"
          @input="emit('updatePassword', ($event.target as HTMLInputElement).value)"
          @blur="emit('blurPassword')"
        >
        <p v-if="passwordError" class="mt-2 text-sm" style="color: var(--danger);">
          {{ passwordError }}
        </p>
      </div>

      <div class="flex items-center justify-end gap-4 pt-2 text-sm">
        <button class="transition disabled:cursor-not-allowed disabled:opacity-60" style="color: var(--text-subtle);" type="button" :disabled="loading">
          忘记密码？
        </button>
      </div>

      <button class="mt-2 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60" style="background: var(--accent);" type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <RouterLink class="block text-center text-sm transition" style="color: var(--text-subtle);" to="/register">
        没有账号？去注册
      </RouterLink>
    </form>
  </div>
</template>
