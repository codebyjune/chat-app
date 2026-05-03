<script setup lang="ts">
defineProps<{
  mode: 'login' | 'register'
}>()

const emit = defineEmits<{
  submit: []
  switchMode: [mode: 'login' | 'register']
}>()

const isLogin = (mode: 'login' | 'register') => mode === 'login'
</script>

<template>
  <div class="rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
    <div class="mb-8 flex items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Secure access</p>
        <h1 class="mt-3 text-3xl font-semibold text-white">
          {{ isLogin(mode) ? 'Welcome back' : 'Create your account' }}
        </h1>
        <p class="mt-3 max-w-sm text-sm leading-6 text-slate-400">
          {{
            isLogin(mode)
              ? 'Sign in to continue your conversations, stay synced, and pick up where you left off.'
              : 'Set up your workspace access and start chatting with the same focused, clean workflow.'
          }}
        </p>
      </div>

      <div class="hidden h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-lg font-semibold text-white shadow-lg shadow-violet-950/40 sm:flex">
        C
      </div>
    </div>

    <div class="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-1">
      <button
        :class="[
          'rounded-2xl px-4 py-3 text-sm font-medium transition',
          isLogin(mode) ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-100',
        ]"
        type="button"
        @click="emit('switchMode', 'login')"
      >
        Login
      </button>
      <button
        :class="[
          'rounded-2xl px-4 py-3 text-sm font-medium transition',
          !isLogin(mode) ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-100',
        ]"
        type="button"
        @click="emit('switchMode', 'register')"
      >
        Register
      </button>
    </div>

    <form class="space-y-4" @submit.prevent="emit('submit')">
      <div v-if="!isLogin(mode)">
        <label class="mb-2 block text-sm font-medium text-slate-300">Full name</label>
        <input
          class="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-500"
          type="text"
          placeholder="June Carter"
        >
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-slate-300">Email</label>
        <input
          class="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-500"
          type="email"
          placeholder="you@company.com"
        >
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-slate-300">Password</label>
        <input
          class="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-500"
          type="password"
          placeholder="••••••••"
        >
      </div>

      <div v-if="!isLogin(mode)">
        <label class="mb-2 block text-sm font-medium text-slate-300">Team name</label>
        <input
          class="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-500"
          type="text"
          placeholder="Product Design"
        >
      </div>

      <div class="flex items-center justify-between gap-4 pt-2 text-sm">
        <label class="flex items-center gap-2 text-slate-400">
          <input class="rounded border-slate-700 bg-slate-950 text-violet-600" type="checkbox">
          <span>{{ isLogin(mode) ? 'Remember me' : 'Accept terms' }}</span>
        </label>
        <button class="text-slate-400 transition hover:text-white" type="button">
          {{ isLogin(mode) ? 'Forgot password?' : 'Invite a teammate later' }}
        </button>
      </div>

      <button class="mt-2 w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500" type="submit">
        {{ isLogin(mode) ? 'Sign in' : 'Create account' }}
      </button>
    </form>
  </div>
</template>
