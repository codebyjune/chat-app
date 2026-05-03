<script setup lang="ts">
import { Check, Search, Trash2, UserPlus, X } from 'lucide-vue-next'
import type { FriendRequest, UserSearchResult } from '../lib/chat'
import type { ConversationItem } from '../types/chat-ui'

defineProps<{
  conversations: ConversationItem[]
  pendingRequests: FriendRequest[]
  friendSearchQuery: string
  searchResults: UserSearchResult[]
  searchLoading: boolean
  conversationSearchQuery: string
  loading: boolean
  requestError: string
}>()

const emit = defineEmits<{
  selectConversation: [id: number]
  updateFriendSearchQuery: [value: string]
  searchUsers: []
  sendFriendRequest: [userId: number]
  updateConversationSearchQuery: [value: string]
  acceptRequest: [id: number]
  rejectRequest: [id: number]
  removeFriend: [id: number]
}>()
</script>

<template>
  <section class="flex h-full min-h-0 flex-col border-r px-6 py-6" style="border-color: var(--border-color); background: var(--bg-surface);">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em]" style="color: var(--text-muted);">消息列表</p>
        <h1 class="mt-2 text-3xl font-semibold" style="color: var(--text-primary);">会话</h1>
      </div>
      <div class="rounded-full px-3 py-1 text-xs" style="background: var(--bg-soft); color: var(--text-subtle);">
        {{ conversations.length }} 位好友
      </div>
    </div>

    <div class="mb-5 rounded-3xl p-4" style="background: var(--bg-surface-muted);">
      <p class="mb-3 text-sm font-semibold" style="color: var(--text-primary);">添加好友</p>
      <div class="flex items-center gap-2">
        <input
          class="flex-1 rounded-2xl px-4 py-3 text-sm outline-none"
          style="background: var(--bg-surface); color: var(--text-primary);"
          type="text"
          placeholder="搜索用户名或邮箱"
          :value="friendSearchQuery"
          :disabled="loading || searchLoading"
          @input="emit('updateFriendSearchQuery', ($event.target as HTMLInputElement).value)"
          @keydown.enter="emit('searchUsers')"
        >
        <button
          class="flex h-11 w-11 items-center justify-center rounded-full text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style="background: var(--accent);"
          type="button"
          :disabled="loading || searchLoading"
          @click="emit('searchUsers')"
        >
          <Search class="h-4 w-4" />
        </button>
      </div>
      <p v-if="requestError" class="mt-2 text-sm" style="color: var(--danger);">
        {{ requestError }}
      </p>
      <div v-if="searchResults.length" class="mt-3 space-y-3">
        <div
          v-for="user in searchResults"
          :key="user.id"
          class="flex items-center justify-between rounded-2xl px-4 py-3"
          style="background: var(--bg-surface);"
        >
          <div class="min-w-0 pr-3">
            <p class="truncate text-sm font-medium" style="color: var(--text-primary);">{{ user.username }}</p>
            <p class="mt-1 truncate text-xs" style="color: var(--text-subtle);">{{ user.email }}</p>
          </div>
          <button
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style="background: var(--accent);"
            type="button"
            :disabled="loading"
            @click="emit('sendFriendRequest', user.id)"
          >
            <UserPlus class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="pendingRequests.length" class="mb-5 rounded-3xl p-4" style="background: var(--bg-surface-muted);">
      <p class="mb-3 text-sm font-semibold" style="color: var(--text-primary);">待处理申请</p>
      <div class="space-y-3">
        <div v-for="request in pendingRequests" :key="request.id" class="rounded-2xl px-4 py-3" style="background: var(--bg-surface);">
          <p class="text-sm font-medium" style="color: var(--text-primary);">{{ request.requester.username }}</p>
          <p class="mt-1 text-xs" style="color: var(--text-subtle);">{{ request.requester.email }}</p>
          <div class="mt-3 flex items-center gap-2">
            <button
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9F9EE] text-[#16A34A] transition hover:bg-[#DDF5E5]"
              type="button"
              @click="emit('acceptRequest', request.id)"
            >
              <Check class="h-4 w-4" />
            </button>
            <button
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDECEC] text-[#E5484D] transition hover:bg-[#FCE0E0]"
              type="button"
              @click="emit('rejectRequest', request.id)"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <label class="mb-5 flex items-center gap-3 rounded-2xl px-4 py-3 focus-within:text-[var(--text-primary)]" style="background: var(--bg-soft); color: var(--text-muted);">
      <Search class="h-4 w-4" />
      <input
        class="w-full bg-transparent text-sm outline-none"
        style="color: var(--text-primary);"
        type="text"
        placeholder="搜索消息"
        :value="conversationSearchQuery"
        @input="emit('updateConversationSearchQuery', ($event.target as HTMLInputElement).value)"
      >
    </label>

    <div class="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
      <article
        v-for="conversation in conversations"
        :key="conversation.id"
        :class="[
          'grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-3xl px-4 py-4 transition',
          conversation.active
            ? ''
            : '',
        ]"
        :style="conversation.active ? { background: 'var(--bg-selected)' } : { background: 'var(--bg-surface)' }"
        @click="emit('selectConversation', conversation.id)"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold" style="background: var(--bg-soft-3); color: var(--text-primary);">
          {{ conversation.avatar }}
        </div>

        <div class="min-w-0">
          <p class="truncate text-sm font-semibold" style="color: var(--text-primary);">{{ conversation.name }}</p>
          <p class="mt-1 truncate text-sm" style="color: var(--text-subtle);">{{ conversation.message }}</p>
        </div>

        <div class="flex flex-col items-end gap-2 self-start">
          <p class="text-xs" style="color: var(--text-muted);">{{ conversation.time }}</p>
          <div
            v-if="conversation.unreadCount > 0"
            class="flex min-w-5 items-center justify-center rounded-full bg-[#1677FF] px-1.5 py-0.5 text-[11px] font-semibold text-white"
          >
            {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
          </div>
          <button class="transition" style="color: var(--text-muted);" type="button" @click.stop="emit('removeFriend', conversation.id)">
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
