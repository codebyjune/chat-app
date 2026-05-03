<script setup lang="ts">
import { AtSign, Ellipsis, Send, Smile, CheckCheck } from "lucide-vue-next";
import type { AuthUser } from "../lib/auth";
import type { FriendListItem } from "../lib/chat";
import type { UiMessage } from "../types/chat-ui";

defineProps<{
  currentUser: AuthUser | null;
  selectedFriend: FriendListItem | null;
  selectedFriendOnline: boolean;
  messages: UiMessage[];
  draftMessage: string;
  sendError: string;
  sending: boolean;
  loadingHistory: boolean;
  hasMoreHistory: boolean;
}>();

const emit = defineEmits<{
  updateDraftMessage: [value: string];
  sendMessage: [];
  loadMoreHistory: [];
}>();
</script>

<template>
  <section class="flex h-full min-h-0 flex-col overflow-hidden"
    style="background: var(--bg-surface); color: var(--text-primary)">
    <header class="flex items-center justify-between border-b px-5 py-4 sm:px-8"
      style="border-color: var(--border-color)">
      <div class="flex items-center gap-4">
        <div class="relative shrink-0">
          <div class="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
            style="background: var(--bg-avatar); color: var(--text-primary)">
            {{
              selectedFriend
                ? selectedFriend.friend.username.slice(0, 2).toUpperCase()
                : "私聊"
            }}
          </div>
          <span v-if="selectedFriend" class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2"
            style="border-color: var(--bg-surface)" :class="selectedFriendOnline ? 'bg-[#22C55E]' : 'bg-[#D1D5DB]'" />
        </div>

        <div>
          <h2 class="text-base font-semibold sm:text-lg" style="color: var(--text-primary)">
            {{
              selectedFriend ? selectedFriend.friend.username : "请选择一个好友"
            }}
          </h2>
          <p class="text-sm" style="color: var(--text-secondary)">
            {{
              selectedFriend ? selectedFriend.friend.email : "登录后可开始聊天"
            }}
          </p>
          <p v-if="selectedFriend" class="mt-1 text-xs" :class="selectedFriendOnline ? 'text-[#16A34A]' : ''" :style="selectedFriendOnline
              ? undefined
              : { color: 'var(--text-secondary)' }
            ">
            {{ selectedFriendOnline ? "在线" : "离线" }}
          </p>
        </div>
      </div>

      <button class="flex h-10 w-10 items-center justify-center rounded-full transition"
        style="color: var(--text-muted); background: transparent">
        <Ellipsis class="h-5 w-5" />
      </button>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8">
      <div v-if="selectedFriend && hasMoreHistory" class="mb-5 flex justify-center">
        <button class="rounded-full px-4 py-2 text-sm transition disabled:cursor-not-allowed"
          style="background: var(--bg-soft); color: var(--text-primary)" type="button" :disabled="loadingHistory"
          @click="emit('loadMoreHistory')">
          {{ loadingHistory ? "加载中..." : "加载更早消息" }}
        </button>
      </div>

      <div v-if="messages.length" class="mb-8 flex items-center justify-center">
        <span class="text-sm" style="color: var(--text-muted)">聊天记录</span>
      </div>

      <div v-else class="flex h-full items-center justify-center text-sm" style="color: var(--text-muted)">
        {{
          selectedFriend
            ? "还没有消息，开始聊聊吧。"
            : "请选择左侧好友开始聊天。"
        }}
      </div>

      <div v-for="message in messages" :key="message.id" :class="message.self ? 'mb-6 flex justify-end' : 'mb-8 flex justify-start'
        ">
        <div v-if="message.self" class="flex max-w-[70%] items-end">
          <div class="bg-[#1677FF] px-2  rounded-md text-white flex gap-2 py-1">

            <p class="text-sm leading-7">{{ message.text }}</p>
            <div
              class="mt-6 flex  items-center      self-end gap-1 text-[11px] text-right text-white/75">
              <span>{{ message.time }}</span>
              <CheckCheck class="h-3.5 w-3.5" :class="message.read ? 'text-white' : 'text-white/75'" />
            </div>
          </div>
        </div>

        <div v-else class="flex max-w-[70%] items-start gap-3">
          <div class="relative mt-1 shrink-0">
            <div class="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold"
              style="background: var(--bg-avatar); color: var(--text-primary)">
              {{ message.from.slice(0, 2).toUpperCase() }}
            </div>
            <span v-if="message.online" class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 "
              style="border-color: var(--bg-surface)" />
          </div>

          <div>
            <div class="  rounded-sm px-2 py-1 flex"
              style="background: var(--bg-soft-3); color: var(--text-primary)">
              <div>     <div class="mb-2 flex flex-wrap items-center gap-2 text-sm">
                <span class="font-semibold" style="color: var(--text-primary)">{{ message.from }}</span>
                <span class="text-xs" style="color: var(--text-muted)">{{
                  message.department
                  }}</span>
              </div>
              <p class="text-sm leading-7">{{ message.text }}</p></div>
         
              <div class=" self-end text-right text-[11px] " style="color: var(--text-muted)">
                {{ message.time }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="border-t px-5 py-4 sm:px-8" style="border-color: var(--border-color)">
      <div class="flex items-center gap-3">
        <button class="flex h-10 w-10 items-center justify-center rounded-full transition"
          style="color: var(--text-muted)">
          <Smile class="h-5 w-5" />
        </button>

        <div class="flex flex-1 items-center gap-3 rounded-full px-4 py-3" style="background: var(--bg-soft)">
          <input class="flex-1 bg-transparent text-sm outline-none" style="color: var(--text-primary)" type="text"
            placeholder="开始输入..." :value="draftMessage" :disabled="!selectedFriend || sending" @input="
              emit(
                'updateDraftMessage',
                ($event.target as HTMLInputElement).value,
              )
              " @keydown.enter="emit('sendMessage')" />
          <button class="flex h-8 w-8 items-center justify-center rounded-full transition"
            style="color: var(--text-muted)">
            <AtSign class="h-4.5 w-4.5" />
          </button>
        </div>

        <button
          class="flex h-11 w-11 items-center justify-center rounded-full bg-[#1677FF] text-white transition hover:bg-[#0F67E6] disabled:cursor-not-allowed disabled:bg-[#8FBCFF]"
          :disabled="!selectedFriend || sending" @click="emit('sendMessage')">
          <Send class="h-5 w-5" />
        </button>
      </div>
      <p v-if="sendError" class="mt-3 text-sm" style="color: var(--danger)">
        {{ sendError }}
      </p>
    </footer>
  </section>
</template>
