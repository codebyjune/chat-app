export type AuthUser = {
  id: number
  username: string
  email: string
  createdAt: string
}

export type LoginResponse = {
  accessToken: string
  user: AuthUser
}

type ErrorPayload = {
  message?: string | string[]
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
const ACCESS_TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'

const getErrorMessage = async (response: Response) => {
  let payload: ErrorPayload | null = null

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

export const register = async (input: {
  username: string
  email: string
  password: string
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<{ message: string }>
}

export const login = async (input: { email: string; password: string }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  const data = await response.json() as LoginResponse
  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))

  return data
}

export const fetchProfile = async () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)

  if (!token) {
    throw new Error('未登录')
  }

  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  const user = await response.json() as AuthUser
  localStorage.setItem(USER_KEY, JSON.stringify(user))

  return user
}

export const updateProfile = async (input: { username: string; email: string }) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)

  if (!token) {
    throw new Error('未登录')
  }

  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  const user = await response.json() as AuthUser
  localStorage.setItem(USER_KEY, JSON.stringify(user))

  return user
}

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)

export const getStoredUser = () => {
  const rawUser = localStorage.getItem(USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as AuthUser
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export const isAuthenticated = () => Boolean(getAccessToken())

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
