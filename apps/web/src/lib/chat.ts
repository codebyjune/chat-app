import { io, type Socket } from 'socket.io-client'
import { getAccessToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_BASE_URL
const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH ?? '/socket.io'

type ApiErrorPayload = {
  message?: string | string[]
}

export type FriendUser = {
  id: number
  username: string
  email: string
}

export type UserSearchResult = {
  id: number
  username: string
  email: string
  createdAt: string
}

export type FriendListItem = {
  friendshipId: number
  friend: FriendUser
  createdAt: string
}

export type FriendRequest = {
  id: number
  status: 'pending' | 'accepted' | 'rejected'
  requester: FriendUser
  addressee: FriendUser
  createdAt: string
  updatedAt: string
}

export type ChatMessage = {
  id: number
  content: string
  sentAt: string
  readAt: string | null
  senderId: number
  receiverId: number
}

type FetchConversationOptions = {
  before?: string
  limit?: number
}

const getErrorMessage = async (response: Response) => {
  let payload: ApiErrorPayload | null = null

  try {
    payload = await response.json()
  } catch {
    return '请求失败，请稍后重试'
  }

  if (Array.isArray(payload?.message)) {
    return payload.message.join('，')
  }

  if (typeof payload?.message === 'string') {
    return payload.message
  }

  return '请求失败，请稍后重试'
}

const authFetch = async (path: string, init?: RequestInit) => {
  const token = getAccessToken()

  if (!token) {
    throw new Error('未登录')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export const fetchFriends = () => authFetch('/friends') as Promise<FriendListItem[]>

export const searchUsers = (query: string) => authFetch(`/users/search?query=${encodeURIComponent(query)}`) as Promise<UserSearchResult[]>

export const fetchPendingFriendRequests = () => authFetch('/friends/requests/pending') as Promise<FriendRequest[]>

export const sendFriendRequest = (userId: number) => authFetch('/friends/request', {
  method: 'POST',
  body: JSON.stringify({ userId }),
}) as Promise<FriendRequest>

export const acceptFriendRequest = (requestId: number) => authFetch(`/friends/request/${requestId}/accept`, {
  method: 'PATCH',
}) as Promise<FriendRequest>

export const rejectFriendRequest = (requestId: number) => authFetch(`/friends/request/${requestId}/reject`, {
  method: 'PATCH',
}) as Promise<FriendRequest>

export const removeFriend = (friendId: number) => authFetch(`/friends/${friendId}`, {
  method: 'DELETE',
})

export const fetchConversation = (userId: number, options?: FetchConversationOptions) => {
  const params = new URLSearchParams()

  if (options?.before) {
    params.set('before', options.before)
  }

  if (options?.limit) {
    params.set('limit', String(options.limit))
  }

  const queryString = params.toString()

  return authFetch(`/messages/conversation/${userId}${queryString ? `?${queryString}` : ''}`) as Promise<ChatMessage[]>
}

export const createChatSocket = () => {
  const token = getAccessToken()

  if (!token) {
    throw new Error('未登录')
  }

  const resolvedSocketBaseUrl = SOCKET_BASE_URL ?? (typeof window !== 'undefined' ? window.location.origin : API_BASE_URL)

  return io(resolvedSocketBaseUrl, {
    path: SOCKET_PATH,
    auth: {
      token,
    },
  }) as Socket
}
