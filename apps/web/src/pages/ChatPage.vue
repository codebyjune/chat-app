<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Socket } from 'socket.io-client'
import AppSidebar from '../components/AppSidebar.vue'
import ChatPanel from '../components/ChatPanel.vue'
import ConversationList from '../components/ConversationList.vue'
import { fetchProfile, getStoredUser, logout, type AuthUser } from '../lib/auth'
import {
  acceptFriendRequest,
  createChatSocket,
  fetchConversation,
  fetchFriends,
  fetchPendingFriendRequests,
  removeFriend,
  rejectFriendRequest,
  searchUsers,
  sendFriendRequest,
  type ChatMessage,
  type FriendListItem,
  type FriendRequest,
  type UserSearchResult,
} from '../lib/chat'
import type { ConversationItem, UiMessage } from '../types/chat-ui'

const router = useRouter()

const currentUser = ref<AuthUser | null>(getStoredUser())
const friends = ref<FriendListItem[]>([])
const pendingRequests = ref<FriendRequest[]>([])
const selectedFriendId = ref<number | null>(null)
const messages = ref<ChatMessage[]>([])
const friendSearchQuery = ref('')
const searchResults = ref<UserSearchResult[]>([])
const searchLoading = ref(false)
const conversationSearchQuery = ref('')
const requestError = ref('')
const sendError = ref('')
const sending = ref(false)
const loading = ref(false)
const draftMessage = ref('')
const socket = ref<Socket | null>(null)
const chatPanelRef = ref<InstanceType<typeof ChatPanel> | null>(null)
const conversationMap = ref<Record<number, ChatMessage[]>>({})
const unreadCountMap = ref<Record<number, number>>({})
const conversationHasMoreMap = ref<Record<number, boolean>>({})
const historyLoadingMap = ref<Record<number, boolean>>({})
const onlineStatusMap = ref<Record<number, boolean>>({})
const conversationPageSize = 20

const formatTime = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const selectedFriend = computed(() => friends.value.find((item) => item.friend.id === selectedFriendId.value) ?? null)
const selectedFriendOnline = computed(() => selectedFriendId.value ? (onlineStatusMap.value[selectedFriendId.value] ?? false) : false)
const loadingHistory = computed(() => selectedFriendId.value ? (historyLoadingMap.value[selectedFriendId.value] ?? false) : false)
const hasMoreHistory = computed(() => selectedFriendId.value ? (conversationHasMoreMap.value[selectedFriendId.value] ?? false) : false)

const getLatestTimestamp = (message?: ChatMessage) => {
  if (!message) {
    return 0
  }

  const timestamp = new Date(message.sentAt).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const upsertConversationMessage = (friendId: number, message: ChatMessage) => {
  const currentConversation = conversationMap.value[friendId] ?? []
  const alreadyExists = currentConversation.some((item) => item.id === message.id)

  if (alreadyExists) {
    return
  }

  conversationMap.value = {
    ...conversationMap.value,
    [friendId]: [...currentConversation, message].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()),
  }
}

const updateConversationMessages = (
  friendId: number,
  updater: (messages: ChatMessage[]) => ChatMessage[],
) => {
  const nextMessages = updater(conversationMap.value[friendId] ?? [])

  conversationMap.value = {
    ...conversationMap.value,
    [friendId]: nextMessages,
  }

  if (friendId === selectedFriendId.value) {
    messages.value = nextMessages
  }
}

const emitConversationRead = (friendId: number) => {
  socket.value?.emit('chat:read', { otherUserId: friendId })
}

const syncPresenceStatus = (userIds: number[]) => {
  const uniqueUserIds = [...new Set(userIds.filter((userId) => userId > 0))]

  if (!socket.value || !uniqueUserIds.length) {
    return
  }

  socket.value.emit(
    'presence:sync',
    { userIds: uniqueUserIds },
    (response: { users?: Array<{ userId: number; online: boolean }> }) => {
      if (!response?.users) {
        return
      }

      const nextStatusMap = { ...onlineStatusMap.value }

      for (const user of response.users) {
        nextStatusMap[user.userId] = user.online
      }

      onlineStatusMap.value = nextStatusMap
    },
  )
}

const scrollChatToBottom = async (behavior: ScrollBehavior = 'auto') => {
  await nextTick()
  await chatPanelRef.value?.scrollToBottom(behavior)
}

const conversationItems = computed<ConversationItem[]>(() => {
  const searchQuery = conversationSearchQuery.value.trim().toLowerCase()

  return friends.value
    .map((item) => {
      const relatedMessages = conversationMap.value[item.friend.id] ?? []
      const latestMessage = relatedMessages.at(-1)

      return {
        id: item.friend.id,
        name: item.friend.username,
        message: latestMessage?.content ?? item.friend.email,
        time: latestMessage ? formatTime(latestMessage.sentAt) : '',
        avatar: item.friend.username.slice(0, 2).toUpperCase(),
        active: item.friend.id === selectedFriendId.value,
        unreadCount: unreadCountMap.value[item.friend.id] ?? 0,
        latestTimestamp: getLatestTimestamp(latestMessage),
      }
    })
    .filter((item) => {
      if (!searchQuery) {
        return true
      }

      return (
        item.name.toLowerCase().includes(searchQuery) ||
        item.message.toLowerCase().includes(searchQuery)
      )
    })
    .sort((left, right) => right.latestTimestamp - left.latestTimestamp)
})

const uiMessages = computed<UiMessage[]>(() => messages.value.map((message) => {
  const isSelf = message.senderId === currentUser.value?.id
  const targetFriend = friends.value.find((item) => item.friend.id === (isSelf ? message.receiverId : message.senderId))
  const friendId = isSelf ? message.receiverId : message.senderId

  return {
    id: message.id,
    from: isSelf ? '你' : (targetFriend?.friend.username ?? '好友'),
    department: isSelf ? '当前用户' : '好友',
    text: message.content,
    self: isSelf,
    time: formatTime(message.sentAt),
    online: !isSelf && (onlineStatusMap.value[friendId] ?? false),
    read: Boolean(message.readAt),
  }
}))

const loadCurrentUser = async () => {
  currentUser.value = await fetchProfile()
}

const loadFriends = async () => {
  friends.value = await fetchFriends()

  syncPresenceStatus(friends.value.map((item) => item.friend.id))

  if (selectedFriendId.value && !friends.value.some((item) => item.friend.id === selectedFriendId.value)) {
    selectedFriendId.value = null
    messages.value = []
  }

  if (!selectedFriendId.value && friends.value.length) {
    selectedFriendId.value = friends.value[0].friend.id
  }
}

const loadPendingRequests = async () => {
  pendingRequests.value = await fetchPendingFriendRequests()
}

const loadConversation = async (friendId: number) => {
  historyLoadingMap.value = {
    ...historyLoadingMap.value,
    [friendId]: true,
  }

  try {
    const conversation = await fetchConversation(friendId, { limit: conversationPageSize })

    conversationMap.value = {
      ...conversationMap.value,
      [friendId]: conversation,
    }
    conversationHasMoreMap.value = {
      ...conversationHasMoreMap.value,
      [friendId]: conversation.length === conversationPageSize,
    }
    unreadCountMap.value = {
      ...unreadCountMap.value,
      [friendId]: 0,
    }
    messages.value = conversation
    emitConversationRead(friendId)
    await scrollChatToBottom()
  } finally {
    historyLoadingMap.value = {
      ...historyLoadingMap.value,
      [friendId]: false,
    }
  }
}

const handleLoadMoreHistory = async () => {
  const friendId = selectedFriendId.value

  if (!friendId || historyLoadingMap.value[friendId]) {
    return
  }

  const currentConversation = conversationMap.value[friendId] ?? []
  const oldestMessage = currentConversation[0]

  if (!oldestMessage) {
    return
  }

  historyLoadingMap.value = {
    ...historyLoadingMap.value,
    [friendId]: true,
  }

  try {
    const olderMessages = await fetchConversation(friendId, {
      before: oldestMessage.sentAt,
      limit: conversationPageSize,
    })

    const mergedConversation = [...olderMessages, ...currentConversation]
    const uniqueConversation = mergedConversation.filter(
      (message, index, source) =>
        source.findIndex((item) => item.id === message.id) === index,
    )

    conversationMap.value = {
      ...conversationMap.value,
      [friendId]: uniqueConversation,
    }
    conversationHasMoreMap.value = {
      ...conversationHasMoreMap.value,
      [friendId]: olderMessages.length === conversationPageSize,
    }
    messages.value = uniqueConversation
    await nextTick()
  } catch (error) {
    sendError.value = error instanceof Error ? error.message : '加载更早消息失败'
  } finally {
    historyLoadingMap.value = {
      ...historyLoadingMap.value,
      [friendId]: false,
    }
  }
}

const handleLogout = () => {
  socket.value?.disconnect()
  logout()
  router.push({ name: 'login' })
}

const handleSendFriendRequest = async () => {
  requestError.value = ''
  const query = friendSearchQuery.value.trim()

  if (!query) {
    requestError.value = '请输入用户名或邮箱'
    return
  }

  searchLoading.value = true

  try {
    searchResults.value = await searchUsers(query)
  } catch (error) {
    requestError.value = error instanceof Error ? error.message : '搜索用户失败'
  } finally {
    searchLoading.value = false
  }
}

const handleRequestFriend = async (userId: number) => {
  requestError.value = ''
  loading.value = true

  try {
    await sendFriendRequest(userId)
    await loadPendingRequests()
    searchResults.value = searchResults.value.filter((item) => item.id !== userId)
  } catch (error) {
    requestError.value = error instanceof Error ? error.message : '发送好友申请失败'
  } finally {
    loading.value = false
  }
}

const handleAcceptRequest = async (requestId: number) => {
  requestError.value = ''
  try {
    await acceptFriendRequest(requestId)
    await Promise.all([loadFriends(), loadPendingRequests()])
  } catch (error) {
    requestError.value = error instanceof Error ? error.message : '接受好友申请失败'
  }
}

const handleRejectRequest = async (requestId: number) => {
  requestError.value = ''
  try {
    await rejectFriendRequest(requestId)
    await loadPendingRequests()
  } catch (error) {
    requestError.value = error instanceof Error ? error.message : '拒绝好友申请失败'
  }
}

const handleRemoveFriend = async (friendId: number) => {
  requestError.value = ''

  try {
    await removeFriend(friendId)
    const nextMap = { ...conversationMap.value }
    delete nextMap[friendId]
    conversationMap.value = nextMap
    await loadFriends()
  } catch (error) {
    requestError.value = error instanceof Error ? error.message : '删除好友失败'
  }
}

const handleSendMessage = async () => {
  sendError.value = ''

  if (!selectedFriendId.value) {
    sendError.value = '请先选择一个好友'
    return
  }

  const content = draftMessage.value.trim()

  if (!content) {
    sendError.value = '消息内容不能为空'
    return
  }

  if (content.length > 1000) {
    sendError.value = '消息内容不能超过 1000 个字符'
    return
  }

  sending.value = true

  try {
    socket.value?.emit('chat:send', {
      receiverId: selectedFriendId.value,
      content,
    })
    draftMessage.value = ''
  } finally {
    sending.value = false
  }
}

const setupSocket = () => {
  socket.value?.disconnect()
  socket.value = createChatSocket()

  socket.value.on('chat:message', (message: ChatMessage) => {
    const friendId = message.senderId === currentUser.value?.id ? message.receiverId : message.senderId
    upsertConversationMessage(friendId, message)

    const belongsToCurrentConversation = friendId === selectedFriendId.value
    const isIncomingMessage = message.senderId !== currentUser.value?.id

    if (isIncomingMessage && !belongsToCurrentConversation) {
      unreadCountMap.value = {
        ...unreadCountMap.value,
        [friendId]: (unreadCountMap.value[friendId] ?? 0) + 1,
      }
    }

    if (belongsToCurrentConversation) {
      unreadCountMap.value = {
        ...unreadCountMap.value,
        [friendId]: 0,
      }
      messages.value = conversationMap.value[friendId] ?? []
      emitConversationRead(friendId)
      void scrollChatToBottom('smooth')
    }
  })

  socket.value.on('chat:read', (payload: { userId: number; messageIds: number[]; readAt: string }) => {
    updateConversationMessages(payload.userId, (currentMessages) =>
      currentMessages.map((message) =>
        payload.messageIds.includes(message.id)
          ? { ...message, readAt: payload.readAt }
          : message,
      ),
    )
  })

  socket.value.on('presence:update', (payload: { userId: number; online: boolean }) => {
    onlineStatusMap.value = {
      ...onlineStatusMap.value,
      [payload.userId]: payload.online,
    }
  })

  socket.value.on('chat:error', (payload: { message?: string }) => {
    sendError.value = payload.message ?? '聊天连接异常'
  })
}

watch(selectedFriendId, async (friendId) => {
  if (!friendId) {
    messages.value = []
    return
  }

  try {
    await loadConversation(friendId)
  } catch (error) {
    sendError.value = error instanceof Error ? error.message : '加载聊天记录失败'
  }
})

onMounted(async () => {
  try {
    await loadCurrentUser()
    await Promise.all([loadFriends(), loadPendingRequests()])
    setupSocket()
  } catch {
    handleLogout()
  }
})

onBeforeUnmount(() => {
  socket.value?.disconnect()
})
</script>

<template>
  <div class="grid h-full overflow-hidden grid-cols-[88px_360px_minmax(0,1fr)] bg-white">
    <AppSidebar :username="currentUser?.username ?? 'U'" @logout="handleLogout" />
    <ConversationList
      :conversations="conversationItems"
      :pending-requests="pendingRequests"
      :friend-search-query="friendSearchQuery"
      :search-results="searchResults"
      :search-loading="searchLoading"
      :conversation-search-query="conversationSearchQuery"
      :loading="loading"
      :request-error="requestError"
      @select-conversation="selectedFriendId = $event"
      @update-friend-search-query="friendSearchQuery = $event"
      @update-conversation-search-query="conversationSearchQuery = $event"
      @search-users="handleSendFriendRequest"
      @send-friend-request="handleRequestFriend"
      @accept-request="handleAcceptRequest"
      @reject-request="handleRejectRequest"
      @remove-friend="handleRemoveFriend"
    />
    <ChatPanel
      ref="chatPanelRef"
      :current-user="currentUser"
      :selected-friend="selectedFriend"
      :selected-friend-online="selectedFriendOnline"
      :messages="uiMessages"
      :draft-message="draftMessage"
      :send-error="sendError"
      :sending="sending"
      :loading-history="loadingHistory"
      :has-more-history="hasMoreHistory"
      @update-draft-message="draftMessage = $event"
      @load-more-history="handleLoadMoreHistory"
      @send-message="handleSendMessage"
    />
  </div>
</template>
