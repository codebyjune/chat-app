<script setup lang="ts">
defineProps<{
  username: string
  email: string
  password: string
  loading: boolean
  usernameError: string
  emailError: string
  passwordError: string
  successMessage: string
}>()

const emit = defineEmits<{
  submit: []
  updateUsername: [value: string]
  updateEmail: [value: string]
  updatePassword: [value: string]
  blurUsername: []
  blurEmail: []
  blurPassword: []
}>()
</script>

<template>
  <div class="w-full max-w-md rounded-[32px] border p-8" style="border-color: var(--border-color); background: var(--bg-surface); box-shadow: var(--shadow-surface);">
    <div class="mb-8">
      <div>
        <h1 class="mt-3 text-3xl font-semibold" style="color: var(--text-primary);">
          注册
        </h1>
        <p class="mt-3 max-w-sm text-sm leading-6" style="color: var(--text-subtle);">
          填写基础信息即可开始使用聊天应用，界面保持简洁清爽。
        </p>
      </div>
    </div>

    <form class="space-y-4" @submit.prevent="emit('submit')">
      <div>
        <label class="mb-2 block text-sm font-medium" style="color: var(--text-secondary);">姓名</label>
        <input
          :class="[
            'w-full rounded-2xl px-4 py-3 text-sm outline-none transition',
            usernameError ? 'ring-1 ring-[#E5484D]' : '',
          ]"
          style="background: var(--bg-soft); color: var(--text-primary);"
          type="text"
          placeholder="请输入姓名"
          :value="username"
          :disabled="loading"
          @input="emit('updateUsername', ($event.target as HTMLInputElement).value)"
          @blur="emit('blurUsername')"
        >
        <p v-if="usernameError" class="mt-2 text-sm" style="color: var(--danger);">
          {{ usernameError }}
        </p>
      </div>

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

      <p v-if="successMessage" class="text-sm" style="color: var(--success);">
        {{ successMessage }}
      </p>

      <button class="mt-2 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60" style="background: var(--accent);" type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>

      <RouterLink class="block text-center text-sm transition" style="color: var(--text-subtle);" to="/login">
        已有账号？去登录
      </RouterLink>
    </form>
  </div>
</template>
