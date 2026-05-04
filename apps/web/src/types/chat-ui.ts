import type { AuthUser } from '../lib/auth'
import type { ChatMessage, FriendListItem, FriendRequest } from '../lib/chat'

export type ConversationItem = {
  id: number
  name: string
  message: string
  time: string
  avatar: string
  active: boolean
  unreadCount: number
  latestTimestamp: number
}

export type UiMessage = {
  id: number
  from: string
  department?: string
  text: string
  self: boolean
  time: string
  read: boolean
}

export type ChatPageState = {
  currentUser: AuthUser | null
  friends: FriendListItem[]
  pendingRequests: FriendRequest[]
  selectedFriendId: number | null
  messages: ChatMessage[]
}
